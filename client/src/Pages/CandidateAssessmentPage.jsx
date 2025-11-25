import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Loader2, Play, Send, CheckCircle, AlertCircle, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CandidateAssessmentPage = () => {
    const { assessmentId } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [code, setCode] = useState('// Write your solution here\n');
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
    const [testResults, setTestResults] = useState([]);

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
            // Set default code template
            const functionName = data.question.functionName || 'solution';
            setCode(`// ${data.question.title}\n// Write your solution below\n\nfunction ${functionName}(args) {\n  // Your code here\n  \n}`);
        } catch (err) {
            console.error("Error fetching assessment:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const runTestCases = (userCode) => {
        const results = [];
        const functionName = assessment.question.functionName || 'solution';

        try {
            assessment.question.examples.forEach((example, index) => {
                try {
                    // Execute user's code in a safe eval context
                    let actualOutput;
                    try {
                        // Prepare arguments for the function call
                        const args = Array.isArray(example.input) ? example.input : [example.input];
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
        setOutput(null);
        setTestResults([]);

        setTimeout(() => {
            try {
                const results = runTestCases(code);
                setTestResults(results);

                const passedCount = results.filter(r => r.passed).length;
                setOutput(`Test Results: ${passedCount}/${results.length} test cases passed`);
            } catch (err) {
                setOutput(`Error: ${err.message}`);
            }
            setIsRunning(false);
        }, 800);
    };

    const handleSubmit = async (autoSubmit = false) => {
        // if (!autoSubmit && !confirm("Are you sure you want to submit? You cannot change your answer after submission.")) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assessment/${assessmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language: 'javascript'
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
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <Clock size={16} />
                        <span>Time Remaining: {formatTime(timeRemaining)}</span>
                    </div>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Submit Solution
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Description */}
                <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{assessment.question.title}</h2>

                        <div className="flex gap-2 mb-6">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded uppercase tracking-wide">
                                {assessment.question.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                JavaScript
                            </span>
                        </div>

                        <div className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {assessment.question.description}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3">Examples</h3>
                        <div className="space-y-4 mb-6">
                            {assessment.question.examples.map((ex, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-700 text-sm">Input:</span>
                                        <code className="ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm">{ex.input}</code>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-700 text-sm">Output:</span>
                                        <code className="ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm">{ex.output}</code>
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
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 font-mono">
                            {assessment.question.constraints}
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
                            value={code}
                            onChange={(value) => setCode(value)}
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
                            {output && (
                                <div className="mb-4">
                                    <div className="text-green-400 font-semibold mb-2">{output}</div>
                                </div>
                            )}

                            {testResults.length > 0 && (
                                <div className="space-y-3">
                                    {testResults.map((result, idx) => (
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

                            {!output && !testResults.length && (
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
