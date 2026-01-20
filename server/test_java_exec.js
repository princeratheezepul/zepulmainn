import { executeJava } from './src/services/codeExecution.service.js';

const test = async () => {
    const code = `
class Solution {
    public int twoSum(int[] nums, int target) {
        return nums[0] + nums[1];
    }
}
    `;

    const testCases = [
        {
            input: [[2, 7, 11, 15], 9],
            output: 9, // Wait, output of twoSum usually indices, but let's test simple sum for now to match my mock code
            functionName: 'twoSum'
        }
    ];

    console.log("Running Java execution test...");
    const result = await executeJava(code, testCases);
    console.log("Result:", JSON.stringify(result, null, 2));
};

test();
