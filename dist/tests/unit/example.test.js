"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Example Test Suite', () => {
    (0, globals_1.it)('should pass a basic test', () => {
        (0, globals_1.expect)(1 + 1).toBe(2);
    });
    (0, globals_1.it)('should handle string operations', () => {
        const message = 'Hello World';
        (0, globals_1.expect)(message.toLowerCase()).toBe('hello world');
    });
    (0, globals_1.it)('should work with arrays', () => {
        const numbers = [1, 2, 3, 4, 5];
        (0, globals_1.expect)(numbers.length).toBe(5);
        (0, globals_1.expect)(numbers.includes(3)).toBe(true);
    });
});
