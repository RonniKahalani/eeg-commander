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
 * This script handles offers common utility features.
 */

/**
 * Returns a string with HTML special characters escaped, to prevent XSS when displaying user-generated content in the UI.
 * @param {*} value 
 * @returns {string}
 */
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Returns a string with line breaks replaced by HTML line break tags.
 * @param {*} value    
 * @returns {string}
 */
function replaceLinebreaks(value) {
    return value.replaceAll('\n', '<br/>').replaceAll('\r', '');
}

/**
 * Because Firefox does not comply with the an input type="number" and prevents it from containing letters, this function is used on inputs with type=number
 * @param {*} event 
 */
function preventNonNumericalInput(event) {
    event = event || window.event;
    var charCode = (typeof event.which == "undefined") ? event.keyCode : event.which;
    var charStr = String.fromCharCode(charCode);

    if (!charStr.match(/^[0-9]+$/))
        event.preventDefault();
}

/**
 * Loads a configuration from a JSON file.
 * @param {*} configPath 
 * @returns {Object} The loaded configuration object, or a default config if loading fails.
 */
async function loadConfig(configPath) {
    const response = await fetch(configPath);
    if (!response.ok) throw new Error(`File not found: ${configPath}`);
    const data = await response.json();
    return data;
}

/**
 * Loads a resource via url
 * @param {*} url 
 * @returns {string}
 */
async function loadUrl(url) {
    const response = await fetch(url);
    if (response.ok) {

        const data = await response.text();
        return data;
    }
    throw new Error(`Failed to load url: ${url}. ${response.statusText}`);
}

/**
 * Loads a resource via url as a JSON object
 * @param {*} url 
 * @returns {Object}  
 */
async function loadUrlAsObject(url) {
    const content = await loadUrl(url);
    return JSON.parse(content);
}

/**
 * Checks to see if the url is valid
 * @param {{string}} url
 * @returns {string}
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Checks data type and tries to format a valid HTML string.
 * @param {*} data 
 * @returns {string}
 */
function prettyFormatData(data) {
    return (typeof data === 'object') ? JSON.stringify(data, null, 2) : replaceLinebreaks(escapeHtml(String(data)));
}

/**
 * Converts data to a string representation.
 * @param {*} data 
 * @returns {string}
 */
function getAsString(data) {
    return (typeof data === 'object') ? JSON.stringify(data) : String(data);
}

/**
 * Displays a toast notification.
 * @param {*} title 
 * @param {*} detail
 * @returns {void} 
 */
function showToast(title, detail, millis = 4000) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 toast border border-emerald-500/40 px-5 py-3 rounded-3xl shadow-2xl flex items-start gap-x-3 z-[200] max-w-xs`;
    toast.innerHTML = `
        <div class="text-emerald-400 mt-0.5"><i class="fa-solid fa-check-circle fa-lg"></i></div>
        <div class="flex-1">
            <div class="font-semibold text-sm">${title}</div>
            ${detail ? `<div class="text-xs text-slate-400 font-mono mt-0.5 break-all">${detail}</div>` : ''}
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
    }, millis);
}

/**
 * Checks if a property is empty (null, undefined, or empty string)
 * @param {*} property 
 * @returns {boolean} True if the property is empty, false otherwise
 */
function isEmpty(property) {
    return property === null || property === undefined || property === '';
}

/**
 * Set the element visibility
 * @param {Element} elem 
 * @param {boolean} visible 
 */
function setVisibility(elem, visible) {
    if (visible) {
        elem.classList.add('flex');
        elem.classList.remove('hidden');

    } else {
        elem.classList.add('hidden');
        elem.classList.remove('flex');
    }
}

/**
 * Returns a reference to a DOM element
 * @param {*} id 
 * @returns {Object}
 */
function byId(id) {
    return document.getElementById(id);
}