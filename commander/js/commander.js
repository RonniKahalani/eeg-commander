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
let config;

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
    patternFilterInput.value = '';
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
    if (logContainer.children.length <= 1) {
        logContainer.innerHTML = `<div class="px-3 py-2 text-xs text-slate-500">Ready. Start simulation or connect a real device to begin pattern detection.</div>`;
    }
}

/**
 * Shows the device info
 */
function showDeviceInfo() {

    if (!isDeviceConnected) {
        alert('No device connected.\nMake sure the device is already paired with your computer.\nClick the Connect button to connect your device.')
        return;
    }

    const info = `Name: ${deviceInfo.name}\nId: ${deviceInfo.deviceId}\nFirmware version: ${deviceInfo.firmwareVersion}\nHardware revision: ${deviceInfo.hardwareRevision}\nModel: ${deviceInfo.model}\nState: ${deviceInfo.state}`;
    alert(info);
}

/**
 * Checks the health of the Shell Server and logs the result.
 * @returns {void}
 */
async function checkShellServerHealth() {
    if (isEmpty(config.shell.host)) return;

    const shellHost = config.shell.host;
    addLogEntry(`Looking for Shell Server at ${shellHost}...`, ACTION_TYPE_SHELL);

    try {
        const response = await fetch(shellHost + '/health');

        if (response.ok) {
            const data = await response.json();
            addLogEntry(`Connected to Shell Server: ${data.hostname} at ${shellHost}`, ACTION_TYPE_SHELL);
        }

    } catch (e) {
        addLogEntry(`[Shell]: Server unreachable at ${shellHost}. ${e.message}. It might be offline or misconfigured. Try starting the server with: node shell-server.js`, LOG_TYPE_ERROR);
    }
}

/**
 * Initializes the shell client
 * @returns {void}
 */
function initShellClient() {
    if (isEmpty(config.shell.host)) return;

    setTimeout(() => {
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
    initShellClient();
    initHubClient();
    initChart();
    initTaskInterval();
    initKeyboardListener();
    initLogoListener();
    initDemoTip();
    initPatternFilter();

    loadSavedPatterns();
    renderPatterns();

    console.log('%c[Commander] Web app initialized successfully. All systems nominal.', 'color:#64748b');
    console.log('%c[Hint] Press "/" to add a new pattern quickly.', 'color:#475569');
}

// Boot the app
window.onload = initializeEverything;
