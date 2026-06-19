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
 * This script handles the log UI and functionality.
 */
const LOG_TYPE_INFO = 'info';
const LOG_TYPE_ERROR = 'error';
const LOG_TYPE_SUCCESS = 'success';
const LOG_TYPE_SYSTEM = 'system';
const LOG_TYPE_TRIGGER = 'trigger';

let logEntries = [];

/**
 * Adds an entry to the log container.
 * @param {*} message 
 * @param {*} type 
 * @param {*} pattern 
 * @param {*} metric
 * @returns {void} 
 */
function addLogEntry(message, type = LOG_TYPE_INFO, pattern = null, metric = null) {
    const logTime = new Date().toLocaleTimeString();

    let html = `<div class="log-entry flex items-start gap-x-3 py-1.5 px-3 border-l-2 `;

    switch (type) {
        case LOG_TYPE_TRIGGER: html += `border-emerald-500 bg-emerald-900/10`; break;
        case LOG_TYPE_ERROR: html += `border-red-500 bg-red-900/10`; break;
        case LOG_TYPE_SUCCESS: html += `border-emerald-400`; break;
        case ACTION_TYPE_SDK: html += `border-violet-400`; break;
        default: html += `border-slate-600`; break;
    }

    html += `">`;
    html += `<span class="font-mono text-sm text-slate-500 w-35 flex-shrink-0">[${logTime}]</span>`;
    html += `<span class="flex-1 text-sm">${replaceLinebreaks(escapeHtml(message))}</span>`;

    if (pattern && metric !== null) {
        html += ` <span class="text-emerald-400 font-mono">(${metric.toFixed(1)} µV)</span>`;
    }

    html += `</span></div>`;

    // Remove initial placeholder if present
    if (logContainer.children.length === 1 && logContainer.children[0].classList.contains('italic')) {
        logContainer.innerHTML = '';
    }

    logContainer.insertAdjacentHTML('beforeend', html);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 18 entries
    while (logContainer.children.length > 18) {
        logContainer.removeChild(logContainer.children[0]);
    }

    logEntries.push({ logTime, message, type });
}

/**
 * Clears the log container and resets log entries.
 * @returns {void}
 */
function clearLog() {
    logContainer.innerHTML = `<div class="text-slate-500 italic px-2 py-4 text-center">Log cleared. New triggers will appear here.</div>`;
    logEntries = [];
}
