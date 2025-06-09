function reverse() {
    let str = document.getElementById("input1").value.trim();
    console.log(str);
    let str_reverse = reverseString(str);
    console.log(str, " : ", str_reverse);
}

function reverseString(str) {
    let reverse_arr = str.split("").reverse();
    return reverse_arr.join("");
}

function pallindrome() {
    let str = document.getElementById("input1").value.trim();
    let str_reverse = reverseString(str);
    if (str == str_reverse) {
        console.log("It is Pallindrome");
    }
    else {
        console.log("It is NOT PALLINDROME");
    }
}

function countVowels() {
    let str = document.getElementById("input1").value.trim();
    let count = 0;
    for (let char of str.toLowerCase()) {
        switch (char) {
            case 'a':
            case 'e':
            case 'i':
            case 'o':
            case 'u':
                count++;
        }
    }
    console.log("No. of vowels: ", count);
}

function lengthOfLongestWord() {
    let str = document.getElementById("input1").value.trim();
    let str_arr = str.split(" ");
    let max = 0;
    str_arr.forEach(s => {
        max = max < s.length ? s.length : max;
    });
    console.log("Length of Longest word: ", max);
}

function checkAnagram() {
    let str1 = document.getElementById("input1").value.trim().toLowerCase();
    let str2 = document.getElementById("input2").value.trim().toLowerCase();

    const l1 = str1.length;
    const l2 = str2.length;

    if (l1 != l2) {
        console.log("NOT ANAGRAM");
        return;
    }

    const count = new Map();

    for (const char of str1) {
        count.set(char, (count.get(char) || 0) + 1);
    }

    for (const char of str2) {
        if (!count.has(char) || count.get(char) === 0) {
            console.log("NOT ANAGRAM");
            return;
        }
        count.set(char, (count.get(char) - 1));
    }
    console.log("ANAGRAM");
}

function firstNonRepeatingCharacter() {
    let str = document.getElementById("input1").value.trim().toLowerCase();

    if (str.length === 1) {
        console.log(str);
        return;
    }
    const count = new Map();

    for (const char of str) {
        count.set(char, (count.get(char) || 0) + 1);
    }

    for (const key of count.keys()) {
        if(count.get(key) === 1) {
            console.log(key);
            return;
        }
    }
    console.log("none");
}

function removeDuplicates() {
    let str = document.getElementById("input1").value.trim().toLowerCase();

    const set = new Set();
    for (const char of str) {
        set.add(char);
    }
    let output = "";
    for (const val of set.values()) {
        output += val;
    }
    console.log(output);
}

function compressString() {
    let str = document.getElementById("input1").value.trim().toLowerCase();

    let count = 1;
    let compressed = "";

    for (let i = 1; i <= str.length; i++) {
        if (str[i] === str[i - 1]) {
            count++;
        } 
        else {
            compressed += str[i - 1] + count;
            count = 1;
        }
    }
    console.log("Compressed string:", compressed);
}

function snakeToCamel() {
    let str = document.getElementById("input1").value.trim().toLowerCase();
    let words = str.split("_");

    let camelCase = words[0];

    for (let i = 1; i < words.length; i++) {
        camelCase += words[i][0].toUpperCase() + words[i].slice(1);
    }

    console.log("Camel Case:", camelCase);
}

function countOccurence() {
    let str = document.getElementById("input1").value.trim();
    let count = new Map();

    for (let char of str) {
        count = count.set(char, (count.get(char) || 0) + 1);
    }

    console.log(count);
}

function lengthOfLongestSubstring() {
    let str = document.getElementById("input1").value.trim();
    let start = 0;
    let max = 0;
    let seen = new Map();

    for (let end = 0; end < str.length; end++) {
        let char = str[end];

        if (seen.has(char) && seen.get(char) >= start) {
            start = seen.get(char) + 1;
        }

        seen.set(char, end);
        max = Math.max(max, end - start + 1);
    }

    console.log("Length of longest substring without repeating characters:", max);
}

function findIndexOf() {
    let str = document.getElementById("input1").value.trim();
    let sub = document.getElementById("input2").value.trim();
    const n = str.length;
    const m = sub.length;

    if (m === 0)  {
        console.log("It is an empty string");
        return;
    }

    for (let i = 0; i <= n - m; i++) {
        let found = true;
        for (let j = 0; j < m; j++) {
            if (str[i + j] !== sub[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            console.log("Index: ",i);
            return;
        }
        console.log("Not found");
    }
}
