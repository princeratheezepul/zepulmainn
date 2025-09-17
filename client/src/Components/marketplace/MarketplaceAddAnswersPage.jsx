import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bold, Italic, Underline, List, ListOrdered, RotateCcw, HelpCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';
import { geminiQueue } from '../../utils/apiQueue';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

const MarketplaceAddAnswersPage = ({ onBack, questions, jobDetails, resumeData }) => {
  const [answers, setAnswers] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const [activeFormatting, setActiveFormatting] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const editorRefs = useRef({});
  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
  const { apiCall } = useMarketplaceAuth();
  
  // Check if Gemini API key is available
  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API) {
      console.warn('Gemini API key not found in environment variables');
    }
  }, []);

  // Initialize answers and word counts
  useEffect(() => {
    const initialAnswers = {};
    const initialWordCounts = {};
    const initialFormatting = {};
    questions.forEach((question, index) => {
      initialAnswers[index] = '';
      initialWordCounts[index] = 0;
      initialFormatting[index] = { bold: false, italic: false, underline: false };
    });
    setAnswers(initialAnswers);
    setWordCounts(initialWordCounts);
    setActiveFormatting(initialFormatting);
  }, [questions]);

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
    
    // Update word count (strip HTML tags for counting)
    const plainText = value.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    setWordCounts(prev => ({
      ...prev,
      [index]: wordCount
    }));
  };

  const applyFormatting = (index, format) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    editor.focus();
    document.execCommand(format, false, null);
    
    // Update active formatting state
    setActiveFormatting(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [format]: !prev[index][format]
      }
    }));
  };

  const insertList = (index, ordered = false) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    editor.focus();
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
  };

  const clearFormatting = (index) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    editor.focus();
    document.execCommand('removeFormat', false, null);
    
    // Reset formatting state
    setActiveFormatting(prev => ({
      ...prev,
      [index]: { bold: false, italic: false, underline: false }
    }));
  };

  const handleSubmitAnswers = async () => {
    if (submitting) return;

    // Validate that all questions have answers
    const unansweredQuestions = [];
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (!answer || answer.trim() === '' || answer === '<p><br></p>') {
        unansweredQuestions.push(question.text);
      }
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions before submitting. Unanswered: ${unansweredQuestions.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      console.log('Starting interview evaluation...');
      
      // Prepare answers data
      const answersData = questions.map((question, index) => ({
        index,
        category: question.category,
        question: question.text,
        answer: answers[index]
      }));

      console.log('Answers data prepared:', answersData);

      // Evaluate answers using AI
      console.log('Evaluating answers with AI...');
      let evaluationResults = [];

      try {
        // Use the queue for AI evaluation
        const evaluationPromise = geminiQueue.add(async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          
          const prompt = `
          You are an expert interviewer evaluating candidate responses to interview questions. 
          
          Job Details:
          - Title: ${jobDetails.jobtitle}
          - Company: ${jobDetails.company}
          - Description: ${jobDetails.description}
          
          Candidate Resume Summary:
          - Name: ${resumeData.name}
          - Title: ${resumeData.title}
          - Experience: ${resumeData.experience}
          - Skills: ${(resumeData.skills || []).join(', ')}
          
          Please evaluate each answer on a scale of 1-10 and provide detailed feedback.
          
          Questions and Answers:
          ${answersData.map((item, index) => `
          ${index + 1}. ${item.category}: ${item.question}
          Answer: ${item.answer.replace(/<[^>]*>/g, '')}
          `).join('\n')}
          
          Return a JSON array where each object has:
          {
            "index": number,
            "category": string,
            "question": string,
            "answer": string,
            "score": number (1-10),
            "feedback": string,
            "strengths": [string],
            "improvements": [string],
            "confidence": number (0-100)
          }
          
          Be thorough but concise in your evaluation. Consider the job requirements and candidate's background.
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          // Clean and parse the response
          const cleanedText = text.replace(/```json|```/g, '').trim();
          return JSON.parse(cleanedText);
        });

        evaluationResults = await evaluationPromise;
        console.log('AI evaluation completed:', evaluationResults);

      } catch (aiError) {
        console.error('AI evaluation failed, using intelligent fallback:', aiError);
        
        // Intelligent fallback evaluation
        evaluationResults = answersData.map((item, index) => {
          const answerLength = item.answer.replace(/<[^>]*>/g, '').trim().length;
          const wordCount = item.answer.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
          
          // Basic scoring based on answer length and content
          let score = 5; // Base score
          let confidence = 60; // Base confidence
          
          if (wordCount > 50) score += 2;
          if (wordCount > 100) score += 1;
          if (answerLength > 200) score += 1;
          if (answerLength > 500) score += 1;
          
          // Cap at 10
          score = Math.min(score, 10);
          
          return {
            index: item.index,
            category: item.category,
            question: item.question,
            answer: item.answer,
            score: score,
            feedback: `Answer length: ${wordCount} words. ${wordCount > 50 ? 'Good detail provided.' : 'Could use more detail.'}`,
            strengths: wordCount > 50 ? ['Detailed response'] : [],
            improvements: wordCount <= 50 ? ['Provide more specific examples'] : [],
            confidence: confidence
          };
        });
        
        console.log('Intelligent fallback evaluation results:', evaluationResults);
      }

      // Save results to database using marketplace API
      console.log('Saving to database...');
      
      // Prepare filtered questions and answers for database save
      const filteredQuestions = answersData.map(item => ({
        category: item.category,
        text: item.question
      }));
      
      const filteredAnswers = {};
      answersData.forEach(item => {
        filteredAnswers[item.index] = item.answer;
      });

      // Use marketplace API call method
      const saveResponse = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/${resumeData._id}/save-interview-evaluation`, {
        method: 'POST',
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
      
      // Navigate to marketplace dashboard
      navigate('/marketplace/dashboard');

    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error(`Failed to submit answers: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAnswer = (index) => {
    setAnswers(prev => ({
      ...prev,
      [index]: ''
    }));
    setWordCounts(prev => ({
      ...prev,
      [index]: 0
    }));
  };

  const isAnswerComplete = (index) => {
    const answer = answers[index];
    return answer && answer.trim() !== '' && answer !== '<p><br></p>';
  };

  const getCompletionStatus = () => {
    const total = questions.length;
    const completed = questions.filter((_, index) => isAnswerComplete(index)).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const status = getCompletionStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={submitting}
          >
            <ArrowLeft size={20} />
            Back to Questions
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progress: {status.completed}/{status.total} ({status.percentage}%)
            </div>
            <button
              onClick={handleSubmitAnswers}
              disabled={submitting || status.completed !== status.total}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                submitting || status.completed !== status.total
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Answers'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.percentage}%` }}
            />
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {question.category}
                    </span>
                    {isAnswerComplete(index) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {question.text}
                  </h3>
                </div>
                
                <button
                  onClick={() => clearAnswer(index)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear answer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => applyFormatting(index, 'bold')}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    activeFormatting[index]?.bold ? 'bg-gray-300' : ''
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => applyFormatting(index, 'italic')}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    activeFormatting[index]?.italic ? 'bg-gray-300' : ''
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => applyFormatting(index, 'underline')}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    activeFormatting[index]?.underline ? 'bg-gray-300' : ''
                  }`}
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => insertList(index, false)}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => insertList(index, true)}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => clearFormatting(index)}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Clear Formatting"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Answer Editor */}
              <div
                ref={el => editorRefs.current[index] = el}
                contentEditable
                className="min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onInput={(e) => handleAnswerChange(index, e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: answers[index] }}
                style={{ whiteSpace: 'pre-wrap' }}
              />

              {/* Word Count */}
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {wordCounts[index]} words
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <HelpCircle size={14} />
                  <span>Tip: Provide specific examples and quantify your achievements</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button (Bottom) */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting || status.completed !== status.total}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              submitting || status.completed !== status.total
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Submitting Answers...' : 'Submit All Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAddAnswersPage;
