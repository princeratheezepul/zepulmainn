import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Loader2, Play, Send, CheckCircle, AlertCircle, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CandidateAssessmentPage = () => {
    const { assessmentId } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assessment, setAssessment] = useState(null);

    // Multi-question state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [codes, setCodes] = useState({}); // Map index -> code string
    const [testResultsMap, setTestResultsMap] = useState({}); // Map index -> results array
    const [outputsMap, setOutputsMap] = useState({}); // Map index -> output string

    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds

    useEffect(() => {
        fetchAssessment();
    }, [assessmentId]);

    // Timer countdown
    useEffect(() => {
        if (!assessment || assessment.completed) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [assessment]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchAssessment = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assessment/${assessmentId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load assessment');
            }

            setAssessment(data);

            // Initialize code for all questions
            const initialCodes = {};
            const questions = data.questions || [data.question]; // Handle both array and legacy single object

            questions.forEach((q, idx) => {
                const functionName = q.functionName || 'solution';
                initialCodes[idx] = `// ${q.title}\n// Write your solution below\n\nfunction ${functionName}(args) {\n  // Your code here\n  \n}`;
            });
            setCodes(initialCodes);

        } catch (err) {
            console.error("Error fetching assessment:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentQuestion = () => {
        if (!assessment) return null;
        const questions = assessment.questions || [assessment.question];
        return questions[currentQuestionIndex];
    };

    const handleCodeChange = (value) => {
        setCodes(prev => ({
            ...prev,
            [currentQuestionIndex]: value
        }));
    };

    const runTestCases = (userCode, question) => {
        const results = [];
        const functionName = question.functionName || 'solution';

        try {
            question.examples.forEach((example, index) => {
                try {
                    // Execute user's code in a safe eval context
                    let actualOutput;
                    try {
                        // Prepare arguments for the function call
                        const args = Array.isArray(example.input) ? example.input : [example.input];

                        // Handle potential legacy string input if needed, though backend should fix this
                        // Assuming args is array for now as per new plan

                        const argsString = args.map(arg => JSON.stringify(arg)).join(', ');

                        const testCode = `
                            ${userCode}
                            const result = ${functionName}(${argsString});
                            JSON.stringify(result);
                        `;

                        // Capture console.log output if needed (advanced)
                        actualOutput = eval(testCode);

                        // Parse back if it's a stringified JSON (from our wrapper)
                        try {
                            if (typeof actualOutput === 'string') {
                                actualOutput = JSON.parse(actualOutput);
                            }
                        } catch (e) {
                            // keep as string if parse fails
                        }

                    } catch (e) {
                        actualOutput = `Error: ${e.message}`;
                    }

                    const expectedOutput = example.output;

                    // Deep comparison for arrays/objects
                    const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

                    results.push({
                        testCase: index + 1,
                        input: JSON.stringify(example.input),
                        expectedOutput: JSON.stringify(expectedOutput),
                        actualOutput: JSON.stringify(actualOutput),
                        passed,
                        explanation: example.explanation
                    });
                } catch (err) {
                    results.push({
                        testCase: index + 1,
                        input: JSON.stringify(example.input),
                        expectedOutput: JSON.stringify(example.output),
                        actualOutput: `Error: ${err.message}`,
                        passed: false,
                        explanation: example.explanation
                    });
                }
            });
        } catch (err) {
            console.error("Test execution error:", err);
        }

        return results;
    };

    const handleRunCode = async () => {
        setIsRunning(true);

        // Clear previous results for this question
        setOutputsMap(prev => ({ ...prev, [currentQuestionIndex]: null }));
        setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: [] }));

        setTimeout(() => {
            try {
                const currentQuestion = getCurrentQuestion();
                const currentCode = codes[currentQuestionIndex];

                const results = runTestCases(currentCode, currentQuestion);

                setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: results }));

                const passedCount = results.filter(r => r.passed).length;
                setOutputsMap(prev => ({
                    ...prev,
                    [currentQuestionIndex]: `Test Results: ${passedCount}/${results.length} test cases passed`
                }));

            } catch (err) {
                setOutputsMap(prev => ({
                    ...prev,
                    [currentQuestionIndex]: `Error: ${err.message}`
                }));
            }
            setIsRunning(false);
        }, 800);
    };

    const handleNext = () => {
        const questions = assessment.questions || [assessment.question];
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        // If not auto-submit and not last question, just go next (shouldn't happen via button, but safe guard)
        const questions = assessment.questions || [assessment.question];
        const isLastQuestion = currentQuestionIndex === questions.length - 1;

        if (!autoSubmit && !isLastQuestion) {
            handleNext();
            return;
        }

        if (!autoSubmit) {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-800">Submit Assessment?</p>
                    <p className="text-sm text-gray-600">You cannot change your answers after submission.</p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                performSubmit(false);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center',
            });
            return;
        }

        performSubmit(true);
    };

    const performSubmit = async (autoSubmit) => {
        setSubmitting(true);
        try {
            // Prepare all submissions with test results
            const submissions = questions.map((q, idx) => {
                const testResults = testResultsMap[idx] || [];
                const passedTests = testResults.filter(r => r.passed).length;
                const totalTests = testResults.length;

                return {
                    questionIndex: idx,
                    code: codes[idx] || '',
                    language: 'javascript',
                    testResults: {
                        passed: passedTests,
                        total: totalTests,
                        details: testResults
                    }
                };
            });

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assessment/${assessmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submissions
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit assessment');
            }

            toast.success(autoSubmit ? 'Time expired! Assessment auto-submitted.' : 'Assessment submitted successfully!');
            setAssessment(prev => ({ ...prev, completed: true }));

        } catch (err) {
            console.error("Error submitting assessment:", err);
            toast.error('Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (assessment?.completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center animate-in zoom-in duration-300">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Submitted!</h2>
                    <p className="text-gray-600">Thank you for completing the assessment. Our team will review your submission shortly.</p>
                </div>
            </div>
        );
    }

    const formatDisplayValue = (value) => {
        if (typeof value === 'string') return value;
        if (value == null) return '';
        try {
            return JSON.stringify(value, null, 2);
        } catch (err) {
            return String(value);
        }
    };

    const currentQuestion = getCurrentQuestion();
    const questions = assessment.questions || [assessment.question];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Found</h2>
                    <p className="text-gray-600">This assessment does not appear to have any questions loaded. Please contact the recruiter.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">ZP</div>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg">Coding Assessment</h1>
                        <p className="text-xs text-gray-500">Candidate: {assessment.candidateName}</p>
                    </div>
                </div>

                {/* Question Navigation Indicator */}
                <div className="flex items-center gap-2">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-3 h-3 rounded-full ${idx === currentQuestionIndex ? 'bg-blue-600' :
                                codes[idx] && codes[idx].length > 100 ? 'bg-green-400' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <Clock size={16} />
                        <span>Time Remaining: {formatTime(timeRemaining)}</span>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0 || submitting}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Submit Test
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Description */}
                <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.title}</h2>

                        <div className="flex gap-2 mb-6">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded uppercase tracking-wide">
                                {currentQuestion.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                JavaScript
                            </span>
                        </div>

                        <div className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {formatDisplayValue(currentQuestion.description)}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3">Examples</h3>
                        <div className="space-y-4 mb-6">
                            {currentQuestion.examples.map((ex, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-700 text-sm">Input:</span>
                                        <code className="ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm whitespace-pre-wrap block">
                                            {formatDisplayValue(ex.input)}
                                        </code>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-700 text-sm">Output:</span>
                                        <code className="ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm whitespace-pre-wrap block">
                                            {formatDisplayValue(ex.output)}
                                        </code>
                                    </div>
                                    {ex.explanation && (
                                        <div className="text-sm text-gray-600 italic">
                                            Explanation: {ex.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3">Constraints</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 font-mono whitespace-pre-wrap">
                            {formatDisplayValue(currentQuestion.constraints)}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Code Editor */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={codes[currentQuestionIndex] || ''}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 },
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="h-2/5 border-t border-gray-700 bg-[#1e1e1e] flex flex-col">
                        <div className="bg-[#252526] px-4 py-2 flex justify-between items-center border-b border-gray-700">
                            <span className="text-gray-300 text-sm font-medium">Console Output</span>
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className="text-gray-300 hover:text-white text-sm flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                {isRunning ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                                Run Code
                            </button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-gray-300">
                            {outputsMap[currentQuestionIndex] && (
                                <div className="mb-4">
                                    <div className="text-green-400 font-semibold mb-2">{outputsMap[currentQuestionIndex]}</div>
                                </div>
                            )}

                            {testResultsMap[currentQuestionIndex] && testResultsMap[currentQuestionIndex].length > 0 && (
                                <div className="space-y-3">
                                    {testResultsMap[currentQuestionIndex].map((result, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${result.passed
                                            ? 'bg-green-900/20 border-green-700'
                                            : 'bg-red-900/20 border-red-700'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {result.passed ? (
                                                    <Check size={16} className="text-green-400" />
                                                ) : (
                                                    <X size={16} className="text-red-400" />
                                                )}
                                                <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                                                    Test Case {result.testCase}
                                                </span>
                                            </div>
                                            <div className="text-xs space-y-1 pl-6">
                                                <div><span className="text-gray-400">Input:</span> {result.input}</div>
                                                <div><span className="text-gray-400">Expected:</span> {result.expectedOutput}</div>
                                                <div><span className="text-gray-400">Actual:</span> {result.actualOutput}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!outputsMap[currentQuestionIndex] && (!testResultsMap[currentQuestionIndex] || testResultsMap[currentQuestionIndex].length === 0) && (
                                <span className="text-gray-500 italic">Run your code to see output...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAssessmentPage;
