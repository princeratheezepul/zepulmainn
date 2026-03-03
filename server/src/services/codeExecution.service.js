import axios from 'axios';

// Wandbox API — free, no API key required, supports Java (OpenJDK 22)
const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';
const JAVA_COMPILER = 'openjdk-jdk-22+36'; // Confirmed available via /api/list.json

/**
 * Calls Wandbox API to compile and run Java code.
 * Returns raw Wandbox result object.
 */
const wandboxExecute = async (code, retries = 2) => {
    let lastError;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const response = await axios.post(WANDBOX_API_URL, {
                compiler: JAVA_COMPILER,
                code: code,
                stdin: '',
                'compiler-option-raw': '',
                'runtime-option-raw': '',
                save: false
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (err) {
            lastError = err;
            console.warn(`Wandbox attempt ${attempt} failed: ${err.message}`);
            if (attempt <= retries) {
                await new Promise(r => setTimeout(r, attempt * 1000));
            }
        }
    }
    throw new Error(`Code execution service unavailable. Last error: ${lastError?.message || 'Unknown'}`);
};

export const executeJava = async (userCode, testCases, mainFunctionName = 'solution') => {
    try {
        // 1. Extract imports from user code
        const importRegex = /import\s+.*?;/g;
        const userImports = userCode.match(importRegex) || [];
        const cleanUserCode = userCode.replace(importRegex, '');

        // 2. Build the full Java program wrapping the user's Solution class
        const fullCode = `
${userImports.join('\n')}
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int passed = 0;
        int total = ${testCases.length};

        ${generateTestCaseCalls(testCases, mainFunctionName)}
    }

    // Deep toString for arrays
    private static String deepToString(Object o) {
        if (o == null) return "null";
        if (o instanceof int[]) return Arrays.toString((int[]) o);
        if (o instanceof long[]) return Arrays.toString((long[]) o);
        if (o instanceof double[]) return Arrays.toString((double[]) o);
        if (o instanceof boolean[]) return Arrays.toString((boolean[]) o);
        if (o instanceof Object[]) return Arrays.deepToString((Object[]) o);
        return o.toString();
    }
}

${cleanUserCode}
`.trim();

        // 3. Call Wandbox
        const result = await wandboxExecute(fullCode);

        // 4. Check for compile error
        if (result.compiler_error && !result.program_output) {
            return {
                error: `Compilation Error:\n${result.compiler_error}`,
                results: []
            };
        }

        // 5. Parse output
        return parseOutput(
            result.program_output || '',
            result.program_error || result.compiler_error || '',
            testCases
        );

    } catch (error) {
        console.error('Code Execution Error:', error.message);
        return {
            error: error.message || 'Failed to execute code',
            results: []
        };
    }
};

/**
 * Generates inline test case evaluation code inside main().
 * Each test runs inline so we can use a simple switch to track pass/fail.
 */
const generateTestCaseCalls = (testCases, functionName) => {
    const lines = [];

    testCases.forEach((tc, idx) => {
        const caseNum = idx + 1;
        const inputs = Array.isArray(tc.input) ? tc.input : [tc.input];
        const args = inputs.map(arg => formatJavaValue(arg)).join(', ');
        const expected = formatJavaValue(tc.output);

        lines.push(`
        // --- Test Case ${caseNum} ---
        try {
            Object result${idx} = solution.${functionName}(${args});
            String actual${idx} = deepToString(result${idx});
            String expected${idx} = deepToString(${expected});
            if (actual${idx}.equals(expected${idx})) {
                System.out.println("Test Case ${caseNum} PASSED");
                passed++;
            } else {
                System.out.println("Test Case ${caseNum} FAILED");
                System.out.println("  Input: ${JSON.stringify(tc.input).replace(/"/g, '\\"')}");
                System.out.println("  Expected: " + expected${idx});
                System.out.println("  Actual:   " + actual${idx});
            }
        } catch (Exception e${idx}) {
            System.out.println("Test Case ${caseNum} FAILED");
            System.out.println("  Error: " + e${idx}.getMessage());
        }`);
    });

    lines.push(`
        System.out.println("\\nResult: " + passed + "/" + total + " test cases passed.");`);

    return lines.join('\n');
};

const formatJavaValue = (val) => {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'number') {
        // Detect if it's really an int or a double
        return Number.isInteger(val) ? val.toString() : `${val}d`;
    }
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'string') return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'new Object[]{}';
        const first = val[0];

        if (Array.isArray(first)) {
            // 2D array
            const elements = val.map(v => formatJavaValue(v)).join(', ');
            if (first.length > 0 && typeof first[0] === 'number') {
                return `new int[][]{${val.map(v => `new int[]{${v.join(', ')}}`).join(', ')}}`;
            }
            return `new Object[][]{${elements}}`;
        }

        if (typeof first === 'number' && val.every(v => Number.isInteger(v))) {
            return `new int[]{${val.join(', ')}}`;
        }
        if (typeof first === 'string') {
            return `new String[]{${val.map(s => `"${s.replace(/"/g, '\\"')}"`).join(', ')}}`;
        }
        return `new Object[]{${val.map(v => formatJavaValue(v)).join(', ')}}`;
    }
    return 'null';
};

const parseOutput = (stdout, stderr, testCases) => {
    // Show compile error if present
    if (stderr && !stdout) {
        return { error: `Runtime Error:\n${stderr}`, results: [] };
    }

    const lines = stdout.split('\n');
    const results = [];

    testCases.forEach((tc, idx) => {
        const caseNum = idx + 1;
        const passedLine = lines.find(l => l.includes(`Test Case ${caseNum} PASSED`));
        const failedLine = lines.find(l => l.includes(`Test Case ${caseNum} FAILED`));

        // Try to extract actual output if printed
        let actualOutput = 'N/A';
        if (failedLine) {
            const actualLineIdx = lines.findIndex(l => l.includes(`Test Case ${caseNum} FAILED`));
            const actualLine = lines.slice(actualLineIdx).find(l => l.trim().startsWith('Actual:'));
            if (actualLine) actualOutput = actualLine.replace('Actual:', '').trim();
        }

        results.push({
            testCase: caseNum,
            passed: !!passedLine,
            input: JSON.stringify(tc.input),
            expectedOutput: JSON.stringify(tc.output),
            actualOutput: passedLine ? JSON.stringify(tc.output) : actualOutput
        });
    });

    // Include stderr inline if there's useful content
    const combinedOutput = stderr ? `${stdout}\n[stderr]: ${stderr}` : stdout;

    return { output: combinedOutput, results };
};
