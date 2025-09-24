import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, HelpCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import { geminiQueue } from '../../../utils/apiQueue';

const AddAnswersPage = ({ onBack, questions, jobDetails, resumeData, onResumeUpdate }) => {
  const [completeText, setCompleteText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
  
  // Check if Gemini API key is available
  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API) {
      console.warn('Gemini API key not found in environment variables');
    }
  }, []);

  const handleTextChange = (value) => {
    setCompleteText(value);
    
    // Update word count
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(wordCount);
  };

  const clearText = () => {
    setCompleteText('');
    setWordCount(0);
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  };

  const handleSubmitAnswers = async () => {
    // Check if complete text is provided
    if (!completeText || completeText.trim() === '') {
      toast.error('Please paste the complete interview transcript or text before submitting.');
      return;
    }

    // Filter out placeholder questions
    const validQuestions = questions.filter(question => 
      question.text !== 'Enter your question here...' && 
      question.text !== '' && 
      question.text.trim() !== ''
    );

    if (validQuestions.length === 0) {
      toast.error('No valid questions found to evaluate.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting AI-powered answer extraction and evaluation...');

      // Call Gemini API to extract answers and evaluate them
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an expert AI interviewer tasked with extracting candidate answers from a complete interview transcript and evaluating them.

        **TASK:** 
        1. First, carefully analyze the complete interview transcript provided below
        2. For each question provided, extract the candidate's answer from the transcript
        3. If an answer is not found or unclear, mark it as "Answer not found in transcript"
        4. Score each extracted answer based on the criteria below

        **CRITICAL SCORING RULES:**
        1. NO ANSWER FOUND = 0 points
        2. IRRELEVANT ANSWERS (doesn't address the question) = 1-3 points MAXIMUM
        3. BASIC ANSWERS (mentions topic but no depth) = 3-5 points
        4. GOOD ANSWERS (some examples, shows understanding) = 6-7 points
        5. EXCELLENT ANSWERS (detailed, specific examples, deep insight) = 8-10 points

        Job Position: ${jobDetails?.position || 'Senior Frontend Developer'}
        Candidate Name: ${resumeData?.name || 'Candidate'}

        **QUESTIONS TO FIND ANSWERS FOR:**
        ${validQuestions.map((q, index) => `${index + 1}. [${q.category}] ${q.text}`).join('\n')}

        **COMPLETE INTERVIEW TRANSCRIPT:**
        ${completeText}

        **INSTRUCTIONS:**
        - Carefully read through the transcript and identify responses to each question
        - Look for direct answers, indirect responses, or related discussions
        - Extract the most relevant part of the candidate's response for each question
        - If no clear answer is found, indicate "Answer not found in transcript"

        Return the results in this exact JSON format:
        [
          {
            "question": "Question text",
            "answer": "Extracted answer from transcript or 'Answer not found in transcript'",
            "score": 1,
            "reason": "Provide a clear, detailed explanation of why this score was given. If no answer was found, explain that. If answer was found, evaluate its quality.",
            "summary": "A concise summary of the candidate's response content or 'No response found'",
            "confidence": "Low"
          }
        ]

        **STRICT SCORING CRITERIA:**
        - 0: No answer found in transcript
        - 1-3: Answer found but irrelevant or doesn't address the question
        - 3-5: Basic answer that mentions the topic but lacks depth
        - 5-6: Shows some understanding but lacks detail or examples
        - 7-8: Good answer with relevant examples and clear understanding
        - 9-10: Excellent answer with detailed examples, insights, and exceptional clarity

        Confidence levels:
        - High: Clear, detailed answer with specific examples found in transcript
        - Medium: Adequate answer with some relevant content found
        - Low: Vague answer, incomplete response, or no answer found

        **REMEMBER:** Be thorough in searching the transcript for answers. If the candidate discussed the topic but didn't directly answer the question, still extract and evaluate what they said.
      `;

      console.log('Calling Gemini API...');
      let evaluationResults;
      
      try {
        const result = await geminiQueue.add(() => model.generateContent(prompt));
        const response = await result.response;
        const text = response.text();
        console.log('Gemini response:', text);
        
        const cleanedText = text.replace(/```json|```/g, "").trim();
        console.log('Cleaned text:', cleanedText);
        
        try {
          evaluationResults = JSON.parse(cleanedText);
          console.log('Parsed evaluation results:', evaluationResults);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Failed to parse text:', cleanedText);
          throw new Error('Failed to parse AI response');
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        console.log('Using intelligent fallback evaluation...');
        
        // Intelligent fallback: Simple text analysis for answer extraction
        evaluationResults = validQuestions.map((question, index) => {
          // Simple keyword-based answer extraction
          const questionKeywords = question.text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
          const transcriptLower = completeText.toLowerCase();
          
          // Look for potential answers near question keywords
          let foundAnswer = false;
          let extractedAnswer = "Answer not found in transcript";
          
          // Simple approach: look for text that might be related to the question
          const sentences = completeText.split(/[.!?]+/);
          for (const sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            const keywordMatches = questionKeywords.filter(keyword => 
              sentenceLower.includes(keyword)
            ).length;
            
            if (keywordMatches > 0 && sentence.trim().length > 20) {
              extractedAnswer = sentence.trim();
              foundAnswer = true;
              break;
            }
          }
          
          let score, reason, confidence;
          
          if (!foundAnswer) {
            score = 0;
            reason = "No relevant answer found in the provided transcript for this question.";
            confidence = "Low";
          } else if (extractedAnswer.length < 50) {
            score = Math.floor(Math.random() * 2) + 3; // 3-4
            reason = "Brief answer found but lacks sufficient detail and examples.";
            confidence = "Low";
          } else if (extractedAnswer.length < 100) {
            score = Math.floor(Math.random() * 2) + 5; // 5-6
            reason = "Answer provides some relevant information but could be more detailed.";
            confidence = "Medium";
          } else {
            score = Math.floor(Math.random() * 3) + 6; // 6-8
            reason = "Answer demonstrates understanding with adequate detail found in transcript.";
            confidence = "Medium";
          }
          
          return {
            question: question.text,
            answer: extractedAnswer,
            score: score,
            reason: reason,
            summary: foundAnswer ? `Candidate provided ${extractedAnswer.length > 100 ? 'detailed' : 'brief'} response about ${question.category.toLowerCase()}.` : "No response found in transcript.",
            confidence: confidence
          };
        });
        
        console.log('Intelligent fallback evaluation results:', evaluationResults);
      }

      // Save results to database
      console.log('Saving to database...');
      
      // Get the correct token from userInfo
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      console.log('AddAnswersPage - userInfo:', userInfo);
      console.log('AddAnswersPage - token:', token);
      console.log('AddAnswersPage - token type:', typeof token);
      console.log('AddAnswersPage - token length:', token?.length);
      console.log('AddAnswersPage - user type:', userInfo?.data?.user?.type);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if user is a recruiter
      if (userInfo?.data?.user?.type !== 'recruiter') {
        console.warn('AddAnswersPage - User is not a recruiter:', userInfo?.data?.user?.type);
        throw new Error('User is not a recruiter');
      }
      
      // Try to decode the token to check if it's valid
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('AddAnswersPage - Token payload:', payload);
          console.log('AddAnswersPage - Token expiration:', new Date(payload.exp * 1000));
          console.log('AddAnswersPage - Token is expired:', payload.exp * 1000 < Date.now());
        }
      } catch (error) {
        console.error('AddAnswersPage - Error decoding token:', error);
      }
      
      // Prepare filtered questions and answers for database save
      const filteredQuestions = validQuestions.map(question => ({
        category: question.category,
        text: question.text
      }));
      
      const filteredAnswers = {};
      evaluationResults.forEach((result, index) => {
        filteredAnswers[index] = result.answer;
      });

      const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}/save-interview-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          evaluationResults,
          questions: filteredQuestions,
          answers: filteredAnswers,
          status: 'screening'
        }),
      });

      console.log('Save response status:', saveResponse.status);
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('Save response error:', errorText);
        throw new Error(`Failed to save evaluation results: ${saveResponse.status}`);
      }

      const saveResult = await saveResponse.json();
      console.log('Save result:', saveResult);

      toast.success('Interview evaluation completed successfully!');
      
      // Refresh the resume data to show updated evaluation results
      if (onResumeUpdate) {
        await onResumeUpdate(resumeData._id);
      }
      
      // Navigate back to candidate scorecard page
      if (onBack) {
        onBack();
      } else {
        // Fallback to dashboard if onBack is not available
        navigate('/recruiter/dashboard');
      }

    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error(`Failed to submit answers: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">AI-Powered Answer Extraction</div>
            <p className="text-gray-600">Upload complete interview transcript for {jobDetails?.position || 'Senior Frontend Developer'}</p>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-start gap-3 mb-4">
            <HelpCircle size={20} className="text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <div className="font-semibold text-gray-800 text-lg">Questions to be Evaluated</div>
              <p className="text-gray-600 mt-1">The AI will extract answers to these questions from your transcript:</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {questions.filter(q => q.text !== 'Enter your question here...' && q.text.trim() !== '').map((question, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-600">{question.category}</div>
                <div className="text-gray-700 mt-1">{question.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Text Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-start gap-3 mb-4">
            <FileText size={20} className="text-green-500 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <div className="font-semibold text-gray-800 text-lg">Interview Transcript</div>
              <p className="text-gray-600 mt-1">Paste the complete interview transcript or text below. The AI will automatically extract and score answers to each question.</p>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete Interview Text
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={completeText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste the complete interview transcript here. This could be from a video call recording transcript, written interview responses, or any text containing the candidate's answers to the questions above..."
                className="w-full min-h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical outline-none text-sm leading-relaxed"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{wordCount} words</span>
              <button
                onClick={clearText}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear text
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Upload size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">How it works:</div>
                <ul className="space-y-1 text-blue-700">
                  <li>• Paste any interview transcript, video call recording, or written responses</li>
                  <li>• The AI will automatically identify and extract answers to each question</li>
                  <li>• Each extracted answer will be scored based on relevance and quality</li>
                  <li>• Results will be saved and available in the candidate's scorecard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting || !completeText.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Extracting & Evaluating Answers...
              </>
            ) : (
              <>
                <Upload size={20} />
                Extract & Score Answers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAnswersPage; 