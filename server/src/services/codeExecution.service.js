import axios from 'axios';

// Wandbox API — free, no API key required
const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';
const JAVA_COMPILER = 'openjdk-jdk-22+36';
const CPP_COMPILER = 'gcc-13.2.0';
const PYTHON_COMPILER = 'cpython-3.12.7';

/**
 * Calls Wandbox API to compile and run code.
 * Returns raw Wandbox result object.
 */
const wandboxExecute = async (compiler, code, retries = 2) => {
    let lastError;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const response = await axios.post(WANDBOX_API_URL, {
                compiler: compiler,
                code: code,
                stdin: '',
                'compiler-option-raw': compiler.includes('gcc') ? '-std=c++20' : '',
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
        const importRegex = /import\s+.*?;/g;
        const userImports = userCode.match(importRegex) || [];
        const cleanUserCode = userCode.replace(importRegex, '');

        const fullCode = `
${userImports.join('\n')}
import java.util.*;
import java.util.stream.*;

class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int passed = 0;
        int total = ${testCases.length};

        ${generateJavaTestCaseCalls(testCases, mainFunctionName)}
    }

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

        const result = await wandboxExecute(JAVA_COMPILER, fullCode);

        if (result.compiler_error && !result.program_output) {
            return {
                error: `Compilation Error:\n${result.compiler_error}`,
                results: []
            };
        }

        return parseOutput(
            result.program_output || '',
            result.program_error || result.compiler_error || '',
            testCases
        );

    } catch (error) {
        console.error('Code Execution Error (Java):', error.message);
        return {
            error: error.message || 'Failed to execute code',
            results: []
        };
    }
};

export const executeCpp = async (userCode, testCases, mainFunctionName = 'solution') => {
    try {
        const fullCode = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <sstream>

// Helper to stringify basic types, vectors, etc.
template<typename T>
std::string deepToString(const T& val);

template<typename T>
std::string deepToString(const std::vector<T>& v) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        ss << deepToString(v[i]) << (i == v.size() - 1 ? "" : ", ");
    }
    ss << "]";
    return ss.str();
}

std::string deepToString(int v) { return std::to_string(v); }
std::string deepToString(long v) { return std::to_string(v); }
std::string deepToString(double v) { return std::to_string(v); }
std::string deepToString(bool v) { return v ? "true" : "false"; }
std::string deepToString(const std::string& v) { return "\\\"" + v + "\\\""; }
std::string deepToString(const char* v) { return "\\\"" + std::string(v) + "\\\""; }

${userCode}

int main() {
    Solution solution;
    int passed = 0;
    int total = ${testCases.length};

    ${generateCppTestCaseCalls(testCases, mainFunctionName)}

    return 0;
}
`.trim();

        const result = await wandboxExecute(CPP_COMPILER, fullCode);

        if (result.compiler_error && !result.program_output) {
            return {
                error: `Compilation Error:\n${result.compiler_error}`,
                results: []
            };
        }

        return parseOutput(
            result.program_output || '',
            result.program_error || result.compiler_error || '',
            testCases
        );
    } catch (error) {
        console.error('Code Execution Error (C++):', error.message);
        return {
            error: error.message || 'Failed to execute code',
            results: []
        };
    }
};

export const executePython = async (userCode, testCases, mainFunctionName = 'solution') => {
    try {
        const fullCode = `
import json

def deep_to_string(o):
    return json.dumps(o)

${userCode}

passed = 0
total = ${testCases.length}

${generatePythonTestCaseCalls(testCases, mainFunctionName)}

print(f"\\nResult: {passed}/{total} test cases passed.")
`.trim();

        const result = await wandboxExecute(PYTHON_COMPILER, fullCode);

        return parseOutput(
            result.program_output || '',
            result.program_error || '',
            testCases
        );
    } catch (error) {
        console.error('Code Execution Error (Python):', error.message);
        return {
            error: error.message || 'Failed to execute code',
            results: []
        };
    }
};

const generateJavaTestCaseCalls = (testCases, functionName) => {
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
        return Number.isInteger(val) ? val.toString() : `${val}d`;
    }
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'string') return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'new Object[]{}';
        const first = val[0];

        if (Array.isArray(first)) {
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

const generateCppTestCaseCalls = (testCases, functionName) => {
    const lines = [];

    testCases.forEach((tc, idx) => {
        const caseNum = idx + 1;
        const inputs = Array.isArray(tc.input) ? tc.input : [tc.input];
        const args = inputs.map(arg => formatCppValue(arg)).join(', ');
        const expected = formatCppValue(tc.output);

        lines.push(`
    // --- Test Case ${caseNum} ---
    try {
        auto result${idx} = solution.${functionName}(${args});
        std::string actual${idx} = deepToString(result${idx});
        std::string expected${idx} = deepToString(${expected});
        if (actual${idx} == expected${idx}) {
            std::cout << "Test Case ${caseNum} PASSED" << std::endl;
            passed++;
        } else {
            std::cout << "Test Case ${caseNum} FAILED" << std::endl;
            std::cout << "  Input: ${JSON.stringify(tc.input).replace(/"/g, '\\"')}" << std::endl;
            std::cout << "  Expected: " << expected${idx} << std::endl;
            std::cout << "  Actual:   " << actual${idx} << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "Test Case ${caseNum} FAILED" << std::endl;
        std::cout << "  Error: " << e.what() << std::endl;
    } catch (...) {
        std::cout << "Test Case ${caseNum} FAILED" << std::endl;
        std::cout << "  Error: Unknown exception" << std::endl;
    }`);
    });

    lines.push(`
    std::cout << "\\nResult: " << passed << "/" << total << " test cases passed." << std::endl;`);

    return lines.join('\n');
};

const formatCppValue = (val) => {
    if (val === null || val === undefined) return '0';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'string') return `std::string("${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'std::vector<int>{}';
        const first = val[0];
        if (Array.isArray(first)) {
            // 2D - assume int for simplicity or recursive
            return `std::vector<std::vector<int>>{${val.map(v => formatCppValue(v)).join(', ')}}`;
        }
        if (typeof first === 'number') return `std::vector<int>{${val.join(', ')}}`;
        if (typeof first === 'string') return `std::vector<std::string>{${val.map(s => `"${s.replace(/"/g, '\\"')}"`).join(', ')}}`;
        return `std::vector<int>{${val.map(v => formatCppValue(v)).join(', ')}}`;
    }
    return '0';
};

const generatePythonTestCaseCalls = (testCases, functionName) => {
    const lines = [];

    testCases.forEach((tc, idx) => {
        const caseNum = idx + 1;
        const inputs = Array.isArray(tc.input) ? tc.input : [tc.input];
        const args = inputs.map(arg => formatPythonValue(arg)).join(', ');
        const expected = formatPythonValue(tc.output);

        lines.push(`
try:
    # --- Test Case ${caseNum} ---
    result${idx} = ${functionName}(${args})
    actual${idx} = deep_to_string(result${idx})
    expected${idx} = deep_to_string(${expected})
    if actual${idx} == expected${idx}:
        print("Test Case ${caseNum} PASSED")
        passed += 1
    else:
        print("Test Case ${caseNum} FAILED")
        print(f"  Input: ${JSON.stringify(tc.input).replace(/"/g, '\\"')}")
        print(f"  Expected: {expected${idx}}")
        print(f"  Actual:   {actual${idx}}")
except Exception as e:
    print("Test Case ${caseNum} FAILED")
    print(f"  Error: {str(e)}")`);
    });

    return lines.join('\n');
};

const formatPythonValue = (val) => {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'string') return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    if (Array.isArray(val)) {
        return `[${val.map(v => formatPythonValue(v)).join(', ')}]`;
    }
    return 'None';
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
