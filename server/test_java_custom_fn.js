import fs from 'fs';
import { executeJava } from './src/services/codeExecution.service.js';

const test = async () => {
    const code = `
import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String key = String.valueOf(ca);
            if (!map.containsKey(key)) map.put(key, new ArrayList<>());
            map.get(key).add(s);
        }
        return new ArrayList<>(map.values());
    }
}
    `;

    const testCases = [
        {
            input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
            output: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]], // Order might vary, but let's see if it runs
            functionName: 'groupAnagrams' // This is ignored by service now, passed as arg
        }
    ];

    console.log("Running Java execution test with custom function name...");
    // Pass 'groupAnagrams' as the 3rd argument
    const result = await executeJava(code, testCases, 'groupAnagrams');

    fs.writeFileSync('test_output_custom.txt', JSON.stringify(result, null, 2));
    console.log("Done. Check test_output_custom.txt");
};

test();
