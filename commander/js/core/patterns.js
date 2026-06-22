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
 * This script handles the patterns.
 */
const NO_TRIGGER_RESPONSES = '<div class="text-xs text-center text-gray-500">No trigger responses yet.</div>';
const PATTERN_TRIGGER_DELAY_MILLIS = 180;
const LOCAL_STORAGE_PATTERNS = 'patterns';

const OPERATOR_GT = '>';
const OPERATOR_LT = '<';
const OPERATOR_GT_OR_EQ = '>=';
const OPERATOR_LT_OR_EQ = '<=';

const ACTION_TYPE_JS = 'js';
const ACTION_TYPE_URL = 'url';
const ACTION_TYPE_SDK = 'sdk';
const ACTION_TYPE_UDP = 'udp';
const ACTION_TYPE_SHELL = 'shell';
const ACTION_TYPE_SOCKET = 'socket';
const ACTION_TYPE_MQTT = 'mqtt';

const actionSettings = new Map();
actionSettings.set(ACTION_TYPE_JS, { color: 'bg-yellow-800', execute: executeJSAction });
actionSettings.set(ACTION_TYPE_UDP, { color: 'bg-red-800', execute: executeUDPAction });
actionSettings.set(ACTION_TYPE_URL, { color: 'bg-green-800', execute: executeUrlAction });
actionSettings.set(ACTION_TYPE_SDK, { color: 'bg-orange-800', execute: executeSDKAction });
actionSettings.set(ACTION_TYPE_SHELL, { color: 'bg-slate-600', execute: executeShellAction });
actionSettings.set(ACTION_TYPE_SOCKET, { color: 'bg-blue-800', execute: executeSocketAction });
actionSettings.set(ACTION_TYPE_MQTT, { color: 'bg-violet-800', execute: executeMqttAction });

let patterns = [];
let responses = [];

/**
 * Finds a response by its id
 * @param {string} id 
 * @returns {object} The response or null if not found
 */
function findResponse(id) {
    return responses.find(r => r.id === id);
}

/**
 * Finds a pattern by its id
 * @param {string} id 
 * @returns {object} The pattern or null if not found
 */
function findPattern(id) {
    return patterns.find(p => p.id === id);
}

/**
 * Creates a summary of the pattern condition
 * @param {object} condition 
 * @returns {string}
 */
function makeConditionSummary(condition) {
    return `${condition.channel.toUpperCase()} ${condition.operator} ${condition.threshold}µV for ${condition.duration}s`;
}

/**
 * Adds a response to the responses array, which can be displayed in the UI. Each response is associated with a pattern ID and a timestamp.
 * @param {*} task 
 * @param {*} pattern 
 * @param {*} data 
 * @param {*} err 
 * @returns {void}
 */
function addResponse(task, pattern, data, err = null) {
    const timestamp = Date.now();
    const response = {
        id: `response-${pattern.id}-${timestamp}`,
        task: (err) ? taskFail(task) : taskSuccess(task),
        pattern: pattern,
        data: data,
        timestamp: timestamp,
        error: err
    };

    responses.push(response);

    const dataAsString = getAsString(data);
    const message = (err) ? err : !isEmpty(dataAsString.trim()) ? dataAsString : (pattern.action?.payload?.replies === 0) ? 'No response expected (replies=0 fire and forget)' : '';
    addLogEntry(`${getPatternLogId(pattern)} ${message}`, (err) ? LOG_TYPE_ERROR : pattern.action.type);

    onResponseChange(responses);

    const callback = (err) ? notifyFail : notifySuccess;
    callback(response);
    return response;
}

/**
 * Finds the appropriate color class for an action type.
 * @param {*} type 
 * @returns {string} Tailwind CSS class for the background color associated with the action type.
 */
function getActionTypeColor(type) {
    if (!actionSettings.has(type)) throw new Error(`Unknown action type ${type}`);
    return actionSettings.get(type).color;
}

/**
 * Returns a summary string of the pattern's condition for display in the UI.
 * @param {*} pattern 
 * @returns {string}
 */
function getConditionSummary(pattern) {
    const cond = pattern.condition;
    return `${cond.channel.toUpperCase()} ${cond.operator} ${cond.threshold}µV for ${cond.duration}s`;
}

/**
 * Filters the list of patterns via a filter argument. It focuses on a patterns name, description and action type.
 * @param {*} filter 
 */
function filterPatterns(filter) {
    const term = (!filter) ? patternFilterInput.value : filter;
    const searchTerm = term.toLowerCase();
    const patternRows = patternsListElem.getElementsByClassName('pattern-row');

    let count = 0;
    Array.from(patternRows).forEach(row => {
        const matches = matchesPatternFilter(findPattern(row.id), searchTerm);
        setVisibility(row, matches);
        if (matches) { count++; }
    });

    patternFilterCountElem.innerHTML = count;
}

/**
 * Validates that the pattern matches the pattern filter
 * @param {*} searchTerm 
 * @param {*} pattern 
 * @returns {void}
 */
function matchesPatternFilter(pattern, searchTerm) {
    const term = (!searchTerm) ? patternFilterInput.value : searchTerm;
    searchTerm = term.toLowerCase();

    return (pattern.name.toLowerCase().includes(searchTerm) ||
        pattern.description.toLowerCase().includes(searchTerm) ||
        pattern.action.type.toLowerCase().includes(searchTerm) ||
        pattern.alias.toLowerCase().includes(searchTerm)) ||
        getConditionSummary(pattern).toLowerCase().includes(searchTerm);
}

/**
 * Toggles the enabled status of a pattern.
 * @param {*} id 
  * @returns {void} 
 */
function togglePatternEnabled(id) {
    const pattern = findPattern(id);
    if (!pattern) throw new Error(`Pattern not found with id: ${id}`)

    pattern.enabled = !pattern.enabled;

    localStorage.setItem(LOCAL_STORAGE_PATTERNS, JSON.stringify(patterns));
    onPatternChange(patterns);
    addLogEntry(`${pattern.name} ${pattern.enabled ? 'enabled' : 'disabled'}`, LOG_TYPE_SYSTEM);
}

/**
 * Deletes a pattern after confirmation.
 * @param {*} id 
 * @returns {void}
 */
function deletePattern(id) {
    if (!confirm('Delete this pattern permanently?')) return;

    patterns = patterns.filter(p => p.id !== id);
    onPatternChange(patterns);
    addLogEntry('Pattern deleted', LOG_TYPE_SYSTEM);
}

/**
 * Exports the current patterns configuration to a file.
 * @returns {void}
 */
function exportPatterns() {
    const config = {
        version: "1.0",
        exported: new Date().toISOString(),
        patterns: patterns.map(p => ({
            name: p.name,
            enabled: p.enabled,
            condition: p.condition,
            action: p.action,
            cooldown: p.cooldown
        }))
    };

    const yamlStr = jsyaml.dump(config, { indent: 2, lineWidth: 80 });
    downloadData(yamlStr, 'text/yaml', `eeg-patterns-${config.exported}.yaml`)

    addLogEntry('Configuration exported as YAML', LOG_TYPE_SUCCESS);
}

/**
 * Downloads the data in a specific content type to a specific file name
 * @param {*} data 
 * @param {*} contentType 
 * @param {*} filename 
 */
function downloadData(data, contentType, filename) {
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);    
}


/**
 * Loads a patterns file
 * @param {*} url 
 */
async function loadPatterns(url) {
    try {

        const response = await fetch(url);
        const yamlText = await response.text();
        const config = jsyaml.load(yamlText);

        if (config.patterns && Array.isArray(config.patterns)) {
            patterns = config.patterns.map((p, i) => ({
                id: 'p' + Date.now() + i,
                name: p.name || 'Unnamed Pattern',
                alias: p.alias || '',
                description: p.description || 'Describe the pattern',
                enabled: p.enabled !== false,
                condition: p.condition || { channel: 'avg', metric: 'moving_avg_abs', operator: OPERATOR_GT, threshold: 30, duration: 2 },
                action: p.action || { type: ACTION_TYPE_JS, payload: 'console.log("imported")' },
                cooldown: p.cooldown || 5,
                lastTriggered: 0,
                triggerCount: 0
            }));

            onPatternChange(patterns);
            addLogEntry(`Loaded ${patterns.length} patterns from YAML (@{url})`, LOG_TYPE_SUCCESS);

            // Save to localStorage
            localStorage.setItem(LOCAL_STORAGE_PATTERNS, JSON.stringify(patterns));

        } else {
            alert('Invalid YAML: missing "patterns" array');
        }
    } catch (err) {
        alert('Failed to parse YAML: ' + err.message);
    }
}

/**
 * Imports patterns from a file and updates the configuration.
 * @returns {void}
 */
function importPatterns() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (ev) {
            loadPatterns(ev.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
}

/**
 * Resets all patterns to their factory defaults.
 * @returns {void}
 */
function resetToDefaults() {
    if (!confirm(`Reset all patterns to factory defaults?\nPress Ok to reset back to default patterns: ${config.patterns}`)) return;

    loadPatterns(config.patterns);
}

/**
 * Loads saved patterns from localStorage.
 * @returns {void}
 */
async function loadSavedPatterns() {
    const saved = localStorage.getItem(LOCAL_STORAGE_PATTERNS);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                patterns = parsed;
                return;
            }
        } catch (e) { }
    }
    // Fallback to defaults
    await loadPatterns(config.patterns);
}

/**
 * Toggles all patterns enabled or disabled
 * @param {*} enabled 
 * @returns {void}
 */
function toggleAllPatternEnabled(enabled) {
    const visiblePatterns = [];

    patterns.forEach(p => {

        const elem = byId(p.id);
        if (!elem.classList.contains('hidden')) {
            p.enabled = enabled;
        }
    });
    onPatternChange(patterns);
}

/**
 * Clones a pattern via id
 * @param {*} id 
 */
function clonePattern(id) {
    const pattern = patterns.find((p) => p.id === id);
    const clone = structuredClone(pattern);
    clone.id = `p${Date.now() + patterns.length}`;

    clone.name += ' Copy';
    patterns.push(clone);

    onPatternChange(patterns);
}

/**
 * Opens edit pattern dialog for a given alias
 * @param {*} alias 
 * @returns {void}
 */
function editPatternViaAlias(alias) {
    const result = patterns.filter((p) => p.alias === alias);
    if (!result || result.length < 1) throw new Error(`Pattern not found with alias: ${alias}`);
    result.forEach((p) => patternDialog.editPattern(p.id));
}

/**
 * Copies a string to the shared system clipboard
 * @param {string} responseId
 * @param {string} text 
 * @returns {boolean} True if the operation was succesful.
 */
async function copyResponseToClipboard(responseId) {
    const response = responses.find((r) => r.id === responseId);
    try {

        const text = (response.task.state === 'success') ? response.data : response.error;
        await navigator.clipboard.writeText(text);
        showToast("Copy", "Response has been copied to the clipboard.");
        return true; // Success

    } catch (err) {
        showToast("Copy", "Failed to copy response to clipboard.\n" + err);
        console.error('Failed to copy:', err);
        return false; // Failed
    }
}

/**
 * Triggers a pattern and executes its associated action.
 * @param {*} pattern 
 * @param {*} metricValue
 * @param {*} eeg
 * @returns {void}
 */
function triggerPattern(pattern, metricValue, eeg) {
    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.type)) throw new Error("Pattern action type is null or empty");

    pattern.lastTriggered = Date.now();
    pattern.triggerCount = (pattern.triggerCount || 0) + 1;

    executePattern(pattern, metricValue, eeg);
    onPatternChange(patterns);
}

/**
 * Triggers all patterns with a given alias
 * @param {*} alias 
 * @returns {void}
 */
function triggerAlias(alias) {
    const result = patterns.filter((p) => p.alias === alias);
    if (!result || result.length < 1) throw new Error(`Pattern not found with alias: ${alias}`);
    result.forEach((p) => triggerPattern(p, null, eegBuffer));
}

/**
 * Executes a pattern action
 * @param {*} pattern 
 * @param {*} eeg 
 * @returns {void}
 */
function executePattern(pattern, metricValue, eeg) {
    notifyStarted(pattern);
    const actionType = pattern.action.type;

    if (!actionSettings.has(actionType)) throw new Error(`Unknown action type ${type}`);

    try {

        actionSettings.get(actionType).execute(pattern, eeg);
        addLogEntry(`${pattern.name} → ${actionType.toUpperCase()}`, LOG_TYPE_TRIGGER, pattern, pattern.metricValue);

    } catch (e) {
        console.error('Pattern execution error:', e);
        addLogEntry(`${getPatternLogId(pattern)} failed: ${e.message}`, LOG_TYPE_ERROR);
    }
}

/**
 * Returns an id for the pattern
 * @param {*} pattern 
 * @returns {string}
 */
function getPatternLogId(pattern) {
    return `[${pattern.name}] [${pattern.action.type.toUpperCase()}]`;
}

/**
 * Checks all defined patterns against the current EEG data to see if they should trigger.
 * @param eeg
 * @returns {void}
 */
function checkAllPatterns(eeg) {
    if (!eeg.length || !patterns.length) return;

    const now = Date.now();

    patterns.forEach(pattern => {
        if (!pattern.enabled) return;

        // Check cooldown
        const timeSinceTriggeredMillis = now - pattern.lastTriggered;
        const cooldownMillis = pattern.cooldown * 1000;
        if ( timeSinceTriggeredMillis < cooldownMillis) return;

        // Get recent samples within duration window
        const durationMillis = pattern.condition.duration * 1000;
        const recentSamples = eeg.filter(d => now - d.timestamp <= durationMillis);

        if (recentSamples.length < 5) return; // not enough data

        const metricValue = getMetricValue(recentSamples, pattern.condition.channel, pattern.condition.metric);
        const threshold = pattern.condition.threshold;
        const operator = pattern.condition.operator;

        if (isConditionMet(metricValue, operator, threshold)) {
            triggerPattern(pattern, metricValue, eeg);
        }
    });
}

/**
 * Checks to see if the trigger condition is met
 * @param {*} metricValue 
 * @param {*} operator 
 * @param {*} threshold 
 * @returns {boolean}
 */
function isConditionMet(metricValue, operator, threshold) {
    switch (operator) {
        case OPERATOR_GT: return metricValue > threshold;
        case OPERATOR_LT: return metricValue < threshold;
        case OPERATOR_GT_OR_EQ: return metricValue >= threshold;
        case OPERATOR_LT_OR_EQ: return metricValue <= threshold;
        default: throw new Error(`Unknown operator: ${operator}`);
    }
}

/**
 * Tests a pattern by simulating a matching metric value.
 * @param {*} id 
 * @returns {void}
 */
function testPattern(id) {
    const pattern = findPattern(id);
    if (!pattern) return;

    addLogEntry(`Manual test: ${pattern.name}`, LOG_TYPE_SYSTEM);

    // Simulate a matching metric value
    const fakeMetric = pattern.condition.threshold + (pattern.condition.operator === OPERATOR_GT || pattern.condition.operator === OPERATOR_GT_OR_EQ ? 12 : -8);

    setTimeout(() => {
        triggerPattern(pattern, fakeMetric);
    }, PATTERN_TRIGGER_DELAY_MILLIS);
}
