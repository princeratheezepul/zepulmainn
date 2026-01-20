import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export const executeJava = async (userCode, testCases, mainFunctionName = 'solution') => {
    try {

        // 1. Extract imports from user code to avoid "class, interface, or enum expected" error
        const importRegex = /import\s+.*?;/g;
        const userImports = userCode.match(importRegex) || [];
        const cleanUserCode = userCode.replace(importRegex, '');

        // 2. Construct the Java runner code
        // We need to wrap the user's Solution class and call it with test cases
        const mainClass = `
${userImports.join('\n')}
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Test Cases Data
        ${generateTestCasesData(testCases)}
        
        int passed = 0;
        int total = ${testCases.length};
        
        for (int i = 0; i < total; i++) {
            try {
                runTestCase(solution, i);
                passed++;
            } catch (Exception e) {
                System.out.println("Test Case " + (i + 1) + " FAILED: " + e.getMessage());
                // e.printStackTrace();
            }
        }
        
        // System.out.println("RESULT:" + passed + "/" + total);
    }

    ${generateRunTestCaseMethod(testCases, mainFunctionName)}
    
    // Helper to print arrays deeply
    private static String toString(Object o) {
        if (o == null) return "null";
        if (o.getClass().isArray()) {
            int len = java.lang.reflect.Array.getLength(o);
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < len; i++) {
                if (i > 0) sb.append(", ");
                sb.append(toString(java.lang.reflect.Array.get(o, i)));
            }
            sb.append("]");
            return sb.toString();
        }
        return o.toString();
    }
}

${cleanUserCode}
`;

        // 2. Send to Piston
        const response = await axios.post(`${PISTON_API_URL}/execute`, {
            language: 'java',
            version: '15.0.2', // Or whatever version Piston supports, usually latest is fine to omit or specify
            files: [
                {
                    name: 'Main.java',
                    content: mainClass
                }
            ]
        });

        const { run } = response.data;

        // 3. Parse Output
        return parseOutput(run, testCases);

    } catch (error) {
        console.error("Piston Execution Error:", error);
        return {
            error: error.message || "Failed to execute code",
            results: []
        };
    }
};

// Helper to generate the data setup for test cases
const generateTestCasesData = (testCases) => {
    // This is complex because we need to inject strict types into Java
    // For now, let's assume simple inputs (int, int[], string) based on the problem types we saw
    // We might need a more robust way to inject data, e.g., parsing JSON in Java
    // BUT Java's built-in JSON parsing is non-existent without libs.
    // So we will hardcode the test cases into the Java source if possible, 
    // OR we can just generate a 'runTestCase' method that has hardcoded calls.
    return ""; // Not needed if we hardcode calls in runTestCase
}

const generateRunTestCaseMethod = (testCases, mainFunctionName) => {
    let methodBody = `private static void runTestCase(Solution solution, int index) throws Exception {\n`;
    methodBody += `    switch(index) {\n`;

    testCases.forEach((tc, idx) => {
        methodBody += `        case ${idx}: {\n`;

        // Prepare inputs
        const inputs = Array.isArray(tc.input) ? tc.input : [tc.input];
        const args = inputs.map(arg => formatJavaValue(arg)).join(', ');

        // Prepare expected output
        const expected = formatJavaValue(tc.output);

        methodBody += `            Object result = solution.${mainFunctionName}(${args});\n`;
        methodBody += `            String actualStr = toString(result);\n`;
        methodBody += `            String expectedStr = toString(${expected});\n`;
        methodBody += `            \n`;
        methodBody += `            if (!actualStr.equals(expectedStr)) {\n`;
        methodBody += `                System.out.println("Test Case " + (index + 1) + " FAILED");\n`;
        methodBody += `                System.out.println("Input: " + ${JSON.stringify(JSON.stringify(tc.input))});\n`;
        methodBody += `                System.out.println("Expected: " + expectedStr);\n`;
        methodBody += `                System.out.println("Actual: " + actualStr);\n`;
        methodBody += `                throw new RuntimeException("Mismatch");\n`;
        methodBody += `            } else {\n`;
        methodBody += `                System.out.println("Test Case " + (index + 1) + " PASSED");\n`;
        methodBody += `            }\n`;
        methodBody += `            break;\n`;
        methodBody += `        }\n`;
    });

    methodBody += `    }\n`;
    methodBody += `}\n`;
    return methodBody;
};

const formatJavaValue = (val) => {
    if (val === null) return 'null';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'string') return `"${val}"`;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'new Object[]{}';
        const first = val[0];

        // Handle nested arrays (2D arrays)
        if (Array.isArray(first)) {
            const elements = val.map(v => formatJavaValue(v)).join(', ');
            // Determine inner type
            if (first.length > 0) {
                if (typeof first[0] === 'string') return `new String[][]{${elements}}`;
                if (typeof first[0] === 'number') return `new int[][]{${elements}}`;
            }
            return `new Object[][]{${elements}}`;
        }

        // Handle 1D arrays
        if (typeof first === 'number') return `new int[]{${val.join(', ')}}`;
        if (typeof first === 'string') return `new String[]{${val.map(s => `"${s}"`).join(', ')}}`;

        // Generic object array
        return `new Object[]{${val.map(v => formatJavaValue(v)).join(', ')}}`;
    }
    return 'null'; // Fallback
};

const parseOutput = (run, testCases) => {
    const output = run.stdout;
    const stderr = run.stderr;

    if (stderr) {
        return {
            error: stderr,
            results: []
        };
    }

    const lines = output.split('\n');
    const results = [];

    // We need to map the output back to results
    // The Java code prints "Test Case X PASSED" or "Test Case X FAILED"
    // along with details.

    testCases.forEach((tc, idx) => {
        const caseNum = idx + 1;
        const passedLine = lines.find(l => l.includes(`Test Case ${caseNum} PASSED`));
        const failedLine = lines.find(l => l.includes(`Test Case ${caseNum} FAILED`));

        if (passedLine) {
            results.push({
                testCase: caseNum,
                passed: true,
                input: JSON.stringify(tc.input),
                expectedOutput: JSON.stringify(tc.output),
                actualOutput: JSON.stringify(tc.output) // It matched
            });
        } else if (failedLine) {
            // Try to extract details if printed
            // This is a bit loose, but good enough for now
            results.push({
                testCase: caseNum,
                passed: false,
                input: JSON.stringify(tc.input),
                expectedOutput: JSON.stringify(tc.output),
                actualOutput: "Mismatch or Error" // Could parse more details if needed
            });
        } else {
            results.push({
                testCase: caseNum,
                passed: false,
                input: JSON.stringify(tc.input),
                expectedOutput: JSON.stringify(tc.output),
                actualOutput: "Execution failed or timed out"
            });
        }
    });

    return {
        output: output,
        results: results
    };
};
