import fs from 'fs';
import { executeJava } from './src/services/codeExecution.service.js';

const test = async () => {
    const code = `
// Some comments
import java.util.*;
import java.util.stream.Collectors;

class Solution {
    public int solution(int[] args) {
        List<Integer> list = new ArrayList<>();
        list.add(1);
        return list.size();
    }
}
    `;

    const testCases = [
        {
            input: [1],
            output: 1,
            functionName: 'solution'
        }
    ];

    console.log("Running Java execution test with imports...");
    const result = await executeJava(code, testCases);
    fs.writeFileSync('test_output.txt', JSON.stringify(result, null, 2));
    console.log("Done. Check test_output.txt");
};

test();
