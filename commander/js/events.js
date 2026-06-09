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
 * This script handles events.
 */

/**
 * Tells the surrounding that a pattern succeded.
 * @param {*} response 
 */
function notifySuccess(response) {
    if (onPatternSuccess) onPatternSuccess(response);
}

/**
 * Tells the surrounding that a pattern failed.
 * @param {*} response 
 */
function notifyFail(response) {
    if (onPatternFail) onPatternFail(response);
}

/**
 * Tells the surrounding that a pattern failed.
 * @param {*} response 
 */
function notifyStarted(pattern) {
    if (onPatternStart) onPatternStart(pattern);
}

/**
 * Event handler for when a pattern is triggered, it updates the UI to indicate that the pattern has been triggered and is waiting for a response.
 * @param {*} pattern 
 * @returns {void}
 */
function onPatternStart(pattern) {
    const target = byId(`example-${pattern.alias}`);
    if (!target) return;

    target.innerHTML = `Pattern triggered, waiting for a response...<span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>`;
}

/**
 * Event handler for when a pattern is successfully triggered.
 * @param {*} response 
 * @returns {void}
 */
function onPatternSuccess(response) {
    const target = byId(`example-${response.pattern.alias}`);
    if (!target) return;

    target.innerHTML = replaceLinebreaks(escapeHtml(getAsString(response.data)));
}

/**
 * Event handler for when a pattern fails to trigger.
 * @param {*} response 
 * @returns {void}
 */
function onPatternFail(response) {
    const target = byId(`example-${response.pattern.alias}`);
    if (!target) return;

    target.innerHTML = replaceLinebreaks(escapeHtml(getAsString(response.error)));
}
