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
 * This script handles the commander UI and functionality.
 */
const LOCAL_STORAGE_PATTERNS = 'patterns';
const LOCAL_STORAGE_MUTED = 'muted';

let isMuted = false;
let currentEditingId = null;
let lastDataTime = Date.now();
let config;

const connectDeviceBtn = byId('connect-btn');
connectDeviceBtn.addEventListener('pointerup', async (event) => await connectDevice(event));

const disconnectDeviceBtn = byId('disconnect-btn');
disconnectDeviceBtn.addEventListener('pointerup', async (event) => await disconnectDevice(event));

/**
 * Displays instructions for integrating the real BrainBit Web SDK.
 * @returns {void}
 */
function showSDKInstructions() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6';
    modal.innerHTML = `
        <div class="neuro-card max-w-2xl w-full rounded-3xl p-8 border border-slate-600 bg-slate-800">
            <div class="flex justify-between mb-6">
                <h3 class="font-semibold text-xl flex items-center gap-x-3"><i class="fa-brands fa-js text-yellow-400"></i> Real BrainBit Web SDK Integration</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-3xl text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div class="prose prose-sm prose-invert text-slate-300">
                <p class="text-sm">To use with a real BrainBit headband:</p>
                
                <ol class="list-decimal pl-5 space-y-2 text-sm">
                    <li>Install: <code class="bg-slate-800 px-2 py-px rounded">npm install web-neurosdk-brainbit</code></li>
                    <li>Import and initialize the client in your bundler (Vite, Webpack, etc.)</li>
                    <li>Replace the simulation functions with real SDK calls</li>
                </ol>
                
                <pre class="bg-slate-950 p-4 rounded-2xl text-xs overflow-auto border border-slate-700"><code>import BrainbitClient from 'web-neurosdk-brainbit';

const brainbitClient = new BrainbitClient();

// Connect
await brainbitClient.connect();

// Subscribe to EEG
brainbitClient.eegStream.subscribe((data) => {
// data = { val0_ch1, val0_ch2, ... }
const processed = {
ch1: data.val0_ch1,
ch2: data.val0_ch2,
ch3: data.val0_ch3,
ch4: data.val0_ch4
};
addToBuffer(processed);   // reuse existing function
});

// Start streaming
await brainbitClient.startEEGStream();</code></pre>
                
                <p class="text-xs text-amber-400 mt-4">Note: Web Bluetooth requires HTTPS and user gesture for connection. The full library supports resistance, status, and markers.</p>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-3xl text-sm">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Initializes the mute feature
 */
function initMuted() {
    setMuted(localStorage.getItem(LOCAL_STORAGE_MUTED) === 'true');
}

/**
 * Initializes the pattern filter
 */
function initPatternFilter() {
    byId('pattern-search-input').value = '';    
}

/**
 * Initializes a logo click listener for an easter egg
 */
function initLogoListener() {
        // Easter egg: click logo to trigger random pattern
    const logo = document.querySelector('.fa-brain');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            if (patterns.length > 0) {
                const random = patterns[Math.floor(Math.random() * patterns.length)];
                addLogEntry('Random test triggered', LOG_TYPE_SYSTEM);
                triggerPattern(random, random.condition.threshold + 15);
            }
        });
    }
}

/**
 * Initializes a demo tip
 */
function initDemoTip() {
    setTimeout(() => {
        if (!isSimulating && patterns.length > 0) {
            showTip('💡 Tip: Click <strong>Simulate</strong> to test patterns instantly', 5200);
        }
    }, 4500);
}

/**
 * Initializes a keyboard listener
 */
function initKeyboardListener() {

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement.tagName === 'BODY') {
            e.preventDefault();
            patternDialog.addPattern();
        }
        if (e.key.toLowerCase() === 's' && e.ctrlKey) {
            e.preventDefault();
            exportPatterns();
        }
    });
}

/**
 * Initializes the log and tests the Shell Server
 */
function initLog() {

    setTimeout(() => {
        const container = byId('log-container');
        if (container.children.length <= 1) {
            container.innerHTML = `<div class="px-3 py-2 text-xs text-slate-500">Ready. Start simulation or connect a real device to begin pattern detection.</div>`;
        }
        checkShellServerHealth();
    }, 200);
}

/**
 * Tailwind script
 */
function initTailwind() {
    document.documentElement.style.setProperty('--accent', '#6366f1');
}

/**
 * Initializes the entire application, including Tailwind, chart, patterns, and event listeners.
 * @returns {void}
 */
async function initializeEverything() {
    initTailwind();
    config = await loadConfig('/commander/data/config/config.json');

    initMuted();
    initLog();
    initHub();
    initChart();
    initTaskInterval();
    initKeyboardListener();
    initLogoListener();
    initDemoTip();
    initPatternFilter();

    loadSavedPatterns();
    renderPatternsList();

    console.log('%c[Commander] Web app initialized successfully. All systems nominal.', 'color:#64748b');
    console.log('%c[Hint] Press "/" to add a new pattern quickly.', 'color:#475569');
}

// Boot the app
window.onload = initializeEverything;
