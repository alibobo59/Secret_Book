import React, { createContext, useContext, useState, useEffect } from "react";

const FiBContext = createContext();

export const useFiB = () => useContext(FiBContext);

const fibonacci = (n) => {
    if (n < 2) return n;
    let a = 0, b = 1, temp;
    for (let i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
};

const generateFibonacciArray = (length) => {
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(fibonacci(i));
    }
    return arr;
};

const isFibonacci = (num) => {
    const isPerfectSquare = (x) => {
        const s = Math.floor(Math.sqrt(x));
        return s * s === x;
    };
    return (
        isPerfectSquare(5 * num * num + 4) ||
        isPerfectSquare(5 * num * num - 4)
    );
};

const fibonacciString = (length) => {
    return generateFibonacciArray(length).join(", ");
};

const generateFibonacciObjects = (length) => {
    return generateFibonacciArray(length).map((num, idx) => ({
        id: idx,
        value: num,
        selected: false,
    }));
};

const generateFibonacciQuiz = (length = 10) => {
    const fibArr = generateFibonacciArray(length);
    const quiz = [];
    for (let i = 0; i < length; i++) {
        const isFib = Math.random() > 0.5;
        let value;
        if (isFib) {
            value = fibArr[Math.floor(Math.random() * fibArr.length)];
        } else {
       
            do {
                value = Math.floor(Math.random() * (fibArr[length - 1] + 10));
            } while (isFibonacci(value));
        }
        quiz.push({
            question: `Số ${value} có phải là số Fibonacci không?`,
            answer: isFibonacci(value),
            value,
        });
    }
    return quiz;
};

const generateRandomFibonacciSequence = (length = 5) => {
    const arr = [];
    let a = 0, b = 1;
    for (let i = 0; i < length; i++) {
        arr.push(a);
        [a, b] = [b, a + b];
    }
    // Trộn mảng
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const isFibonacciSequence = (arr) => {
    if (arr.length < 3) return false;
    for (let i = 2; i < arr.length; i++) {
        if (arr[i] !== arr[i - 1] + arr[i - 2]) return false;
    }
    return true;
};

const generateFibonacciFillQuiz = (length = 7) => {
    const arr = generateFibonacciArray(length);
    const missingIndex = Math.floor(Math.random() * (length - 2)) + 1;
    const answer = arr[missingIndex];
    const quizArr = arr.slice();
    quizArr[missingIndex] = null;
    return {
        question: `Điền số còn thiếu vào dãy: ${quizArr
            .map((n) => (n === null ? "___" : n))
            .join(", ")}`,
        answer,
        quizArr,
        missingIndex,
    };
};

const generateFibonacciChoiceQuiz = (length = 5) => {
    const fibArr = generateFibonacciArray(length + 2);
    const choices = [];
    while (choices.length < 4) {
        let num;
        if (choices.length === 0) {
            num = fibArr[length];
        } else {
            do {
                num = Math.floor(Math.random() * (fibArr[length] + 10));
            } while (isFibonacci(num) || choices.includes(num));
        }
        choices.push(num);
    }

    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return {
        question: `Chọn số Fibonacci đúng tiếp theo sau dãy: ${fibArr
            .slice(0, length)
            .join(", ")}`,
        answer: fibArr[length],
        choices,
    };
};

export const FiBProvider = ({ children }) => {
    const [fibArray, setFibArray] = useState(generateFibonacciArray(10));
    const [fibObjects, setFibObjects] = useState(generateFibonacciObjects(10));
    const [quiz, setQuiz] = useState(generateFibonacciQuiz(10));
    const [fillQuiz, setFillQuiz] = useState(generateFibonacciFillQuiz(7));
    const [choiceQuiz, setChoiceQuiz] = useState(generateFibonacciChoiceQuiz(5));
    const [randomSequence, setRandomSequence] = useState(
        generateRandomFibonacciSequence(5)
    );

    // Hàm cập nhật mảng số Fibonacci
    const updateFibArray = (length) => {
        setFibArray(generateFibonacciArray(length));
        setFibObjects(generateFibonacciObjects(length));
    };

    const checkIsFibonacci = (num) => isFibonacci(num);

    const checkIsFibonacciSequence = (arr) => isFibonacciSequence(arr);

    const newQuiz = (length = 10) => setQuiz(generateFibonacciQuiz(length));

    const newFillQuiz = (length = 7) =>
        setFillQuiz(generateFibonacciFillQuiz(length));
    const newChoiceQuiz = (length = 5) =>
        setChoiceQuiz(generateFibonacciChoiceQuiz(length));

    const newRandomSequence = (length = 5) =>
        setRandomSequence(generateRandomFibonacciSequence(length));

    const selectFibObject = (id) => {
        setFibObjects((prev) =>
            prev.map((obj) =>
                obj.id === id ? { ...obj, selected: !obj.selected } : obj
            )
        );
    };

    const resetFibObjects = () => {
        setFibObjects((prev) => prev.map((obj) => ({ ...obj, selected: false })));
    };

    const getFibonacciString = (length) => fibonacciString(length);

    const value = {
        fibArray,
        fibObjects,
        quiz,
        fillQuiz,
        choiceQuiz,
        randomSequence,
        updateFibArray,
        checkIsFibonacci,
        checkIsFibonacciSequence,
        newQuiz,
        newFillQuiz,
        newChoiceQuiz,
        newRandomSequence,
        selectFibObject,
        resetFibObjects,
        getFibonacciString,
    };

    return (
        <FiBContext.Provider value={value}>{children}</FiBContext.Provider>
    );
};

export default FiBContext;