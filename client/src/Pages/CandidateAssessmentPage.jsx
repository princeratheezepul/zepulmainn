import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Loader2, Play, Send, CheckCircle, AlertCircle, Clock, Check, X, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import initSqlJs from 'sql.js';

const CandidateAssessmentPage = () => {
    const { assessmentId } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assessment, setAssessment] = useState(null);

    // Multi-question state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [codes, setCodes] = useState({}); // Map index -> code string
    const [languages, setLanguages] = useState({}); // Map index -> language string
    const [testResultsMap, setTestResultsMap] = useState({}); // Map index -> results array
    const [outputsMap, setOutputsMap] = useState({}); // Map index -> output string

    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
    const [assessmentType, setAssessmentType] = useState('standard'); // 'standard' or 'avaloq'
    const sqlDbRef = useRef(null);

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

            const isAvaloq = data.assessmentType === 'avaloq';
            setAssessmentType(isAvaloq ? 'avaloq' : 'standard');

            // Set timer based on assessment type
            if (isAvaloq) {
                setTimeRemaining(90 * 60); // 90 minutes for Avaloq
            }

            // Initialize sql.js for Avaloq assessments
            if (isAvaloq) {
                try {
                    const SQL = await initSqlJs({
                        locateFile: () => '/sql-wasm.wasm'
                    });
                    const db = new SQL.Database();

                    // Create tables separately for reliability
                    db.run(`CREATE TABLE customers (
                        customer_id INTEGER PRIMARY KEY,
                        name TEXT,
                        email TEXT,
                        account_type TEXT,
                        created_at TEXT
                    )`);
                    db.run(`CREATE TABLE accounts (
                        account_id INTEGER PRIMARY KEY,
                        customer_id INTEGER,
                        account_type TEXT,
                        balance REAL,
                        currency TEXT,
                        status TEXT,
                        opened_at TEXT,
                        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
                    )`);
                    db.run(`CREATE TABLE transactions (
                        txn_id INTEGER PRIMARY KEY,
                        from_account_id INTEGER,
                        to_account_id INTEGER,
                        amount REAL,
                        txn_type TEXT,
                        status TEXT,
                        created_at TEXT,
                        FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
                        FOREIGN KEY (to_account_id) REFERENCES accounts(account_id)
                    )`);

                    // Insert sample banking data
                    const inserts = [
                        "INSERT INTO customers VALUES (1, 'Alice Johnson', 'alice@bank.com', 'premium', '2023-01-15')",
                        "INSERT INTO customers VALUES (2, 'Bob Smith', 'bob@bank.com', 'standard', '2023-03-20')",
                        "INSERT INTO customers VALUES (3, 'Charlie Lee', 'charlie@bank.com', 'premium', '2023-06-10')",
                        "INSERT INTO customers VALUES (4, 'Diana Ross', 'diana@bank.com', 'standard', '2024-01-05')",
                        "INSERT INTO customers VALUES (5, 'Eve Walker', 'eve@bank.com', 'premium', '2024-02-14')",
                        "INSERT INTO accounts VALUES (1001, 1, 'savings', 75000.00, 'USD', 'active', '2023-01-15')",
                        "INSERT INTO accounts VALUES (1002, 1, 'checking', 25000.00, 'USD', 'active', '2023-02-01')",
                        "INSERT INTO accounts VALUES (1003, 2, 'savings', 50000.00, 'USD', 'active', '2023-03-20')",
                        "INSERT INTO accounts VALUES (1004, 2, 'checking', 12000.00, 'USD', 'inactive', '2023-04-10')",
                        "INSERT INTO accounts VALUES (1005, 3, 'savings', 120000.00, 'USD', 'active', '2023-06-10')",
                        "INSERT INTO accounts VALUES (1006, 3, 'checking', 45000.00, 'USD', 'active', '2023-07-01')",
                        "INSERT INTO accounts VALUES (1007, 4, 'savings', 8000.00, 'USD', 'active', '2024-01-05')",
                        "INSERT INTO accounts VALUES (1008, 5, 'savings', 95000.00, 'USD', 'active', '2024-02-14')",
                        "INSERT INTO accounts VALUES (1009, 5, 'checking', 30000.00, 'USD', 'active', '2024-03-01')",
                        "INSERT INTO transactions VALUES (1, 1001, 1003, 5000.00, 'debit', 'success', '2024-01-10')",
                        "INSERT INTO transactions VALUES (2, 1003, 1001, 3000.00, 'credit', 'success', '2024-01-15')",
                        "INSERT INTO transactions VALUES (3, 1005, 1006, 10000.00, 'debit', 'success', '2024-02-01')",
                        "INSERT INTO transactions VALUES (4, 1001, 1005, 2000.00, 'debit', 'success', '2024-02-10')",
                        "INSERT INTO transactions VALUES (5, 1006, 1001, 7500.00, 'credit', 'success', '2024-02-15')",
                        "INSERT INTO transactions VALUES (6, 1008, 1009, 15000.00, 'debit', 'success', '2024-03-01')",
                        "INSERT INTO transactions VALUES (7, 1001, 1002, 1000.00, 'debit', 'success', '2024-03-05')",
                        "INSERT INTO transactions VALUES (8, 1005, 1003, 8000.00, 'debit', 'success', '2024-03-10')",
                        "INSERT INTO transactions VALUES (9, 1002, 1007, 500.00, 'debit', 'failed', '2024-03-12')",
                        "INSERT INTO transactions VALUES (10, 1009, 1001, 2500.00, 'credit', 'success', '2024-03-15')",
                        "INSERT INTO transactions VALUES (11, 1001, 1008, 6000.00, 'debit', 'success', '2024-03-18')",
                        "INSERT INTO transactions VALUES (12, 1003, 1006, 4000.00, 'debit', 'success', '2024-03-20')"
                    ];
                    inserts.forEach(sql => db.run(sql));

                    sqlDbRef.current = db;
                    console.log('✓ SQLite database initialized with banking data');
                } catch (sqlErr) {
                    console.error('Failed to initialize SQL.js:', sqlErr);
                }
            }

            // Initialize code for all questions
            const initialCodes = {};
            const initialLanguages = {};
            const questions = data.questions || [data.question];

            questions.forEach((q, idx) => {
                const functionName = q.functionName || 'solution';
                const section = (q.section || '').toLowerCase();

                // For Avaloq assessments, set language based on question section
                if (isAvaloq && (section.includes('sql') || section.includes('banking') || section.includes('debugging'))) {
                    initialLanguages[idx] = 'sql';
                    initialCodes[idx] = `-- ${q.title}\n-- Write your SQL query below\n-- Available tables: customers, accounts, transactions\n\n-- customers(customer_id, name, email, account_type, created_at)\n-- accounts(account_id, customer_id, account_type, balance, currency, status, opened_at)\n-- transactions(txn_id, from_account_id, to_account_id, amount, txn_type, status, created_at)\n\nSELECT * FROM customers;\n`;
                } else if (isAvaloq && section.includes('coding')) {
                    initialLanguages[idx] = 'java';
                    initialCodes[idx] = `// ${q.title}\n// Write your solution below\n\nimport java.util.*;\n\nclass Solution {\n    public Object ${functionName}(Object... args) {\n        // Your code here\n        return null;\n    }\n}`;
                } else {
                    // Standard assessment - default to Java
                    initialLanguages[idx] = 'java';
                    initialCodes[idx] = `// ${q.title}\n// Write your solution below\n\nimport java.util.*;\n\nclass Solution {\n    public Object ${functionName}(Object... args) {\n        // Your code here\n        return null;\n    }\n}`;
                }
            });
            setCodes(initialCodes);
            setLanguages(initialLanguages);

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

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguages(prev => ({
            ...prev,
            [currentQuestionIndex]: newLang
        }));

        // Generate new boilerplate for the selected language
        const currentQuestion = getCurrentQuestion();
        const functionName = currentQuestion?.functionName || 'solution';

        let newCode = '';
        if (newLang === 'sql') {
            newCode = `-- ${currentQuestion?.title || 'Question'}
-- Write your SQL query below
-- Available tables: customers, accounts, transactions

-- customers(customer_id, name, email, account_type, created_at)
-- accounts(account_id, customer_id, account_type, balance, currency, status, opened_at)
-- transactions(txn_id, from_account_id, to_account_id, amount, txn_type, status, created_at)

SELECT * FROM customers;
`;
        } else if (newLang === 'java') {
            newCode = `// ${currentQuestion?.title || 'Question'}
// Write your solution below

import java.util.*;

class Solution {
    public Object ${functionName}(Object... args) {
        // Your code here
        return null;
    }
}`;
        } else if (newLang === 'cpp') {
            newCode = `#include <iostream>
#include <vector>
#include <string>

class Solution {
public:
    // Update the return type and arguments based on the problem
    int ${functionName}(std::vector<int>& nums, int target) {
        // Your code here
        return 0;
    }
};`;
        } else if (newLang === 'python') {
            newCode = `def ${functionName}(nums, target):
    \"\"\"
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    \"\"\"
    # Your code here
    pass`;
        } else {
            // JavaScript
            newCode = `// ${currentQuestion?.title || 'Question'}
// Write your solution below

/**
 * @param {any[]} args - Arguments passed as an array
 * @return {any} - Return the result
 */
function ${functionName}(...args) {
    // Note: args is an array of arguments passed to the function
    // For example, if input is [1, 2], args[0] is 1, args[1] is 2
    
    // Your code here
    return null;
}`;
        }

        setCodes(prev => ({
            ...prev,
            [currentQuestionIndex]: newCode
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
        const currentLang = languages[currentQuestionIndex] || 'java';

        // Clear previous results for this question
        setOutputsMap(prev => ({ ...prev, [currentQuestionIndex]: null }));
        setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: [] }));

        try {
            const currentQuestion = getCurrentQuestion();
            const currentCode = codes[currentQuestionIndex];

            if (currentLang === 'sql') {
                // SQL execution via sql.js (client-side SQLite)
                try {
                    // Auto-initialize if not ready yet
                    if (!sqlDbRef.current) {
                        const SQL = await initSqlJs({
                            locateFile: () => '/sql-wasm.wasm'
                        });
                        const db = new SQL.Database();
                        db.run(`CREATE TABLE IF NOT EXISTS customers (customer_id INTEGER PRIMARY KEY, name TEXT, email TEXT, account_type TEXT, created_at TEXT)`);
                        db.run(`CREATE TABLE IF NOT EXISTS accounts (account_id INTEGER PRIMARY KEY, customer_id INTEGER, account_type TEXT, balance REAL, currency TEXT, status TEXT, opened_at TEXT)`);
                        db.run(`CREATE TABLE IF NOT EXISTS transactions (txn_id INTEGER PRIMARY KEY, from_account_id INTEGER, to_account_id INTEGER, amount REAL, txn_type TEXT, status TEXT, created_at TEXT)`);
                        const inserts = [
                            "INSERT INTO customers VALUES (1, 'Alice Johnson', 'alice@bank.com', 'premium', '2023-01-15')",
                            "INSERT INTO customers VALUES (2, 'Bob Smith', 'bob@bank.com', 'standard', '2023-03-20')",
                            "INSERT INTO customers VALUES (3, 'Charlie Lee', 'charlie@bank.com', 'premium', '2023-06-10')",
                            "INSERT INTO customers VALUES (4, 'Diana Ross', 'diana@bank.com', 'standard', '2024-01-05')",
                            "INSERT INTO customers VALUES (5, 'Eve Walker', 'eve@bank.com', 'premium', '2024-02-14')",
                            "INSERT INTO accounts VALUES (1001, 1, 'savings', 75000.00, 'USD', 'active', '2023-01-15')",
                            "INSERT INTO accounts VALUES (1002, 1, 'checking', 25000.00, 'USD', 'active', '2023-02-01')",
                            "INSERT INTO accounts VALUES (1003, 2, 'savings', 50000.00, 'USD', 'active', '2023-03-20')",
                            "INSERT INTO accounts VALUES (1004, 2, 'checking', 12000.00, 'USD', 'inactive', '2023-04-10')",
                            "INSERT INTO accounts VALUES (1005, 3, 'savings', 120000.00, 'USD', 'active', '2023-06-10')",
                            "INSERT INTO accounts VALUES (1006, 3, 'checking', 45000.00, 'USD', 'active', '2023-07-01')",
                            "INSERT INTO accounts VALUES (1007, 4, 'savings', 8000.00, 'USD', 'active', '2024-01-05')",
                            "INSERT INTO accounts VALUES (1008, 5, 'savings', 95000.00, 'USD', 'active', '2024-02-14')",
                            "INSERT INTO accounts VALUES (1009, 5, 'checking', 30000.00, 'USD', 'active', '2024-03-01')",
                            "INSERT INTO transactions VALUES (1, 1001, 1003, 5000.00, 'debit', 'success', '2024-01-10')",
                            "INSERT INTO transactions VALUES (2, 1003, 1001, 3000.00, 'credit', 'success', '2024-01-15')",
                            "INSERT INTO transactions VALUES (3, 1005, 1006, 10000.00, 'debit', 'success', '2024-02-01')",
                            "INSERT INTO transactions VALUES (4, 1001, 1005, 2000.00, 'debit', 'success', '2024-02-10')",
                            "INSERT INTO transactions VALUES (5, 1006, 1001, 7500.00, 'credit', 'success', '2024-02-15')",
                            "INSERT INTO transactions VALUES (6, 1008, 1009, 15000.00, 'debit', 'success', '2024-03-01')",
                            "INSERT INTO transactions VALUES (7, 1001, 1002, 1000.00, 'debit', 'success', '2024-03-05')",
                            "INSERT INTO transactions VALUES (8, 1005, 1003, 8000.00, 'debit', 'success', '2024-03-10')",
                            "INSERT INTO transactions VALUES (9, 1002, 1007, 500.00, 'debit', 'failed', '2024-03-12')",
                            "INSERT INTO transactions VALUES (10, 1009, 1001, 2500.00, 'credit', 'success', '2024-03-15')",
                            "INSERT INTO transactions VALUES (11, 1001, 1008, 6000.00, 'debit', 'success', '2024-03-18')",
                            "INSERT INTO transactions VALUES (12, 1003, 1006, 4000.00, 'debit', 'success', '2024-03-20')"
                        ];
                        inserts.forEach(sql => db.run(sql));
                        sqlDbRef.current = db;
                        console.log('✓ SQLite database initialized on-demand');
                    }

                    // Execute the SQL query
                    const results = sqlDbRef.current.exec(currentCode);

                    if (results.length === 0) {
                        setOutputsMap(prev => ({
                            ...prev,
                            [currentQuestionIndex]: 'Query executed successfully. No rows returned.'
                        }));
                        setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: [] }));
                    } else {
                        // Format results as a readable table
                        let outputStr = '';
                        results.forEach((result, rIdx) => {
                            const { columns, values } = result;
                            // Column headers
                            outputStr += columns.join(' | ') + '\n';
                            outputStr += columns.map(() => '---').join(' | ') + '\n';
                            // Rows
                            values.forEach(row => {
                                outputStr += row.map(v => v === null ? 'NULL' : String(v)).join(' | ') + '\n';
                            });
                            outputStr += `\n(${values.length} row${values.length !== 1 ? 's' : ''} returned)`;
                            if (rIdx < results.length - 1) outputStr += '\n\n';
                        });

                        setOutputsMap(prev => ({
                            ...prev,
                            [currentQuestionIndex]: outputStr
                        }));
                        setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: [] }));
                    }
                } catch (sqlErr) {
                    setOutputsMap(prev => ({
                        ...prev,
                        [currentQuestionIndex]: `SQL Error: ${sqlErr.message}`
                    }));
                }
                setIsRunning(false);
                return;

            } else if (currentLang === 'java' || currentLang === 'cpp' || currentLang === 'python') {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assessment/${assessmentId}/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: currentCode,
                        language: currentLang,
                        questionIndex: currentQuestionIndex
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Execution failed');
                }

                if (data.error) {
                    setOutputsMap(prev => ({
                        ...prev,
                        [currentQuestionIndex]: `Error:\n${data.error}`
                    }));
                } else {
                    setTestResultsMap(prev => ({ ...prev, [currentQuestionIndex]: data.results }));
                    const passedCount = data.results.filter(r => r.passed).length;
                    setOutputsMap(prev => ({
                        ...prev,
                        [currentQuestionIndex]: `Test Results: ${passedCount}/${data.results.length} test cases passed\n\nOutput:\n${data.output || ''}`
                    }));
                }
            } else {
                // Legacy JS Client-side execution
                setTimeout(() => {
                    try {
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
                }, 800);
            }

        } catch (err) {
            setOutputsMap(prev => ({
                ...prev,
                [currentQuestionIndex]: `Error: ${err.message}`
            }));
        } finally {
            // For JS timeout, this might run before timeout finishes if not careful, 
            // but for Java it waits for fetch.
            if (currentLang === 'java') {
                setIsRunning(false);
            } else {
                setTimeout(() => setIsRunning(false), 800);
            }
        }
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
            // Derive questions from current assessment state (avoid using render-scope variables)
            const currentAssessment = assessment;
            const qs = currentAssessment
                ? (currentAssessment.questions || [currentAssessment.question])
                : [];

            // Prepare all submissions
            const submissions = qs.map((_, idx) => ({
                questionIndex: idx,
                code: codes[idx] || '',
                language: languages[idx] || 'java'
            }));

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

    // Security disabled for testing

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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Assessment</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (assessment?.completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
                        <CheckCircle className="text-green-500" size={44} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Assessment Submitted!</h2>
                    <p className="text-gray-500 text-base mb-6">
                        Your answers have been recorded successfully. You may now close this window.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 border border-gray-100">
                        Assessment ID: <span className="font-mono text-gray-600">{assessmentId}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Security overlays disabled for testing

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
            // ... (No Question State) ...
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
                    <img src="/zepul_trademark.jpg" alt="Zepul Logo" className="h-10 w-28 object-contain" />
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg">Coding Assessment</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Candidate: {assessment.candidateName}</span>
                        </div>
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

                        <div className="flex gap-2 mb-6 items-center">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded uppercase tracking-wide">
                                {currentQuestion.difficulty}
                            </span>
                            <select
                                value={languages[currentQuestionIndex] || 'java'}
                                onChange={handleLanguageChange}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border-none focus:ring-0 cursor-pointer"
                            >
                                {assessmentType === 'avaloq' && <option value="sql">SQL</option>}
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
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
                            defaultLanguage="java"
                            theme="vs-dark"
                            language={languages[currentQuestionIndex] === 'sql' ? 'sql' : (languages[currentQuestionIndex] || 'java')}
                            value={codes[currentQuestionIndex] || ''}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 },
                                contextmenu: true,
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
