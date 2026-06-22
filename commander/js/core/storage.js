"use strict"

/*
Copyright (c) 2026 Ronni Kahalani

X: https://x.com/RonniKahalani
Github: https://github.com/RonniKahalani
Website: https://learningisliving.dk
LinkedIn: https://www.linkedin.com/in/kahalani/

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
*/

/**
 * This script handles the local storage.
 */
const LOCAL_STORAGE_PATTERNS = 'patterns';
const LOCAL_STORAGE_MUTED = 'muted';

/**
 * Returns the muted property from local storage
 * @param {*} muted 
 * @returns {boolean} True is muted
 */
function getLocalStorageMuted() {
    return localStorage.getItem(LOCAL_STORAGE_MUTED) === 'true';
}

/**
 * Sets the muted property in local storage
 * @param {boolean} muted 
 */
function setLocalStorageMuted(muted) {
    localStorage.setItem(LOCAL_STORAGE_MUTED, muted);
}

/**
 * Returns a JSON parsed patterns array object from local storage
 * @returns {Object} a parsed object from local storage
 */
function getLocalStoragePatterns() {
    const dataStr = localStorage.getItem(LOCAL_STORAGE_PATTERNS);
    if (!dataStr) return;

    try {
        const parsed = JSON.parse(dataStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (e) { console.error('Failed to load patterns from local storage: ' + e.message) }
}

/**
 * Stringifies a patterns object and sets it in local storage
 * @param {*} patterns 
 */
function setLocalStoragePatterns(patterns) {
    localStorage.setItem(LOCAL_STORAGE_PATTERNS, JSON.stringify(patterns));
}
