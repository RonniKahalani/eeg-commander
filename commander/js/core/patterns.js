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

let patterns = [];
let responses = [];

/**
 * Toggles the visibility of a response element in the UI when the "eye" button is clicked.
 * @param {string} responseId 
 */
function showResponse(responseId) {
    const response = findResponse(responseId);
    if (!response) throw new Error(`Response event not found with id: (${responseId})`);

    const isSuccess = response.task.state === "success";
    let isJSON = false;

    if (!isEmpty(response.data)) {
        try {
            const result = JSON.parse(response.data);
            isJSON = true;
        } catch (e) {
            // Ignore, isJSON is by default set to false.
            console.log(e.message);
        }
    }

    const dataDiv = byId("response-details-data");
    const errorDiv = byId("response-details-error");

    dataDiv.innerHTML = isSuccess ? prettyFormatData(response.data) : '';
    errorDiv.innerHTML = !isSuccess ? response.error : '';

    byId("response-details-id").innerHTML = responseId;
    byId("response-details-success").innerHTML = isSuccess;

    byId("response-details-starttime").innerHTML = new Date(response.task.startTime).toLocaleString();
    byId("response-details-endtime").innerHTML = new Date(response.task.endTime).toLocaleString();
    byId("response-details-json").innerHTML = isJSON;

    setVisibility(dataDiv, isSuccess);
    setVisibility(errorDiv, !isSuccess);

    const modal = byId('response-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

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

    if (responses.length === 1) {
        const responseList = byId('responses-list');
        responseList.innerHTML = '';
    }

    updateEventsUI();

    const callback = (err) ? notifyFail : notifySuccess;
    callback(response);
    return response;
}

/**
 * Updates the Events UI
 */
function updateEventsUI() {

    responsesListElem.innerHTML = '';

    responses.forEach((response, index) => {

        const task = response.task;
        const failedState = task.state === TASK_STATE_FAILED
        const borderColor = failedState ? 'border-red-700' : 'border-green-600';
        const status = failedState ? response.error : 'Completed successfully.';
        const responseId = response.id;
        const pattern = response.pattern;

        const responseHtml = `
<div id="${responseId}" class="response-row ${borderColor} cursor-pointer group items-center justify-between gap-x-3 px-4 py-3 rounded-2xl border border-slate-700 hover:border-slate-600" onclick="showResponse('${responseId}')">
    <div class="flex-1 min-w-0" title="${status}">

        <div class="float-right flex items-center gap-x-1">
            <div class="px-1.5 py-px text-[12px] rounded ${getActionTypeColor(pattern.action.type)} text-white-400 font-mono">${pattern.action.type}</div>
        </div>
                
         <div class="flex items-center gap-x-1">
            <div class="font-semibold text-sm truncate">${pattern.name}</div>           
        </div>

        <div class="float-right mt-1">
            <button id="response-copy-btn" title="Copy to clipboard" onclick="event.stopImmediatePropagation(); copyResponseToClipboard('${responseId}')" 
                class="px-2 py-1.5 text-indigo-400 hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-copy fa-sm"></i></button>

        <button id="response-edit-pattern-btn" title="Edit pattern" onclick="event.stopImmediatePropagation(); patternDialog.editPattern('${pattern.id}')" 
                class="px-2 py-1.5 text-indigo-400 hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-edit fa-sm"></i></button>

            <button id="show-response-btn" title="Show response" onclick="event.stopImmediatePropagation(); showResponse('${responseId}')" 
                class="px-2 py-1.5 text-indigo-400 hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-eye fa-sm"></i></button>
        </div>

        <div class="text-xs text-slate-500 font-mono truncate">Trigger: ${makeConditionSummary(pattern.condition)}</div>
        <div class="text-xs text-slate-500 font-mono">State: ${task.state}</div>
    </div>
</div>`;

        responsesListElem.innerHTML = responseHtml + responsesListElem.innerHTML;
        responseCountElem.innerHTML = responses.length;
    })
}

/**
 * Removes all responses
 */
function clearResponses() {
    responses = [];
    tasks = [];
    responsesListElem.innerHTML = NO_TRIGGER_RESPONSES;
    responseCountElem.innerHTML = 0;
}

/**
 * Finds the appropriate color class for an action type.
 * @param {*} type 
 * @returns {string} Tailwind CSS class for the background color associated with the action type.
 */
function getActionTypeColor(type) {
    switch (type) {
        case ACTION_TYPE_JS: return 'bg-yellow-800';
        case ACTION_TYPE_UDP: return 'bg-red-800';
        case ACTION_TYPE_URL: return 'bg-green-800';
        case ACTION_TYPE_SDK: return 'bg-orange-800';
        case ACTION_TYPE_SHELL: return 'bg-slate-600';
        case ACTION_TYPE_SOCKET: return 'bg-blue-800';
        case ACTION_TYPE_MQTT: return 'bg-violet-800';
        default: throw new Error(`Unknown action type ${type}`);
    }
}

/**
 * Renders the list of defined patterns.
 * @returns {void}
 */
function renderPatternsList() {
    patternsListElem.innerHTML = '';

    if (!patterns.length) {
        patternsListElem.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">No patterns defined yet.<br>Click "New Pattern" to begin.</div>`;
        return;
    }

    let count = 0;
    patterns.forEach(pattern => {

        if (isEmpty(pattern.condition)) throw new Error("Pattern condition is null or empty");
        if (isEmpty(pattern.condition.operator)) throw new Error("Pattern condition operator is null or empty");
        if (isEmpty(pattern.condition.threshold)) throw new Error("Pattern condition threshold is null or empty");
        if (isEmpty(pattern.condition.duration)) throw new Error("Pattern condition duration is null or empty");
        if (isEmpty(pattern.condition.channel)) throw new Error("Pattern condition channel is null or empty");
        if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
        if (isEmpty(pattern.action.type)) throw new Error("Pattern action type is null or empty");
        if (isEmpty(pattern.enabled)) throw new Error("Pattern enabled is null or empty");

        const div = document.createElement('div');
        div.className = `pattern-row group items-center justify-between gap-x-3 px-4 py-3 rounded-2xl border border-slate-700 hover:border-slate-600 ${pattern.enabled ? '' : 'opacity-60'}`;
        div.id = pattern.id;

        div.innerHTML = `
            <div class="flex-1 min-w-0" title="${pattern.description}">
                <div class="float-right flex items-center gap-x-2">
                    <div class="px-1.5 py-px text-[12px] rounded ${getActionTypeColor(pattern.action.type)} text-white-400 font-mono action-type">${pattern.action.type}</div>

                    <label title="Toggle pattern enabled" class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" ${pattern.enabled ? 'checked' : ''} onchange="togglePatternEnabled('${pattern.id}')" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>

                </div>
                <div class="flex items-center gap-x-2">
                    <div class="font-semibold text-sm truncate">${pattern.name}</div>
                </div>
                <div class="flex items-center gap-x-1 opacity-50 group-hover:opacity-100 transition-opacity float-right">

                    <button id="delete-pattern-btn" title="Delete pattern" onclick="deletePattern('${pattern.id}')" 
                        class="px-2 py-1.5 text-red-400 hover:bg-red-900/30 rounded-xl"><i class="fa-solid fa-trash fa-sm"></i></button>

                    <button id="clone-pattern-btn" title="Clone pattern" onclick="clonePattern('${pattern.id}')" 
                        class="px-2 py-1.5 text-indigo-400 hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-copy fa-sm"></i></button>

                    <button id="edit-pattern-btn" title="Edit pattern" onclick="patternDialog.editPattern('${pattern.id}')" 
                        class="px-2 py-1.5 text-indigo-400 hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-edit fa-sm"></i></button>

                    <button id="test-pattern-btn" title="Test pattern" onclick="testPattern('${pattern.id}');" 
                        class="px-2 py-1.5 text-emerald-400 hover:bg-emerald-700 rounded-xl"><i class="fa-solid fa-play fa-sm"></i></button>

                </div>
                <div class="text-xs text-slate-500 font-mono truncate">${getConditionSummary(pattern)}</div>
                <div width="100%" class="text-[12px] font-mono text-emerald-400">${pattern.triggerCount || 0} <span class="text-slate-500 -mt-0.5">triggers</span></div>
            </div>
        `;

        patternsListElem.appendChild(div);
        filterPatterns();
        patternFilterCountElem.innerHTML = ++count;
        patternCountElem.innerHTML = count;
    });
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
        const pattern = findPattern(row.id);
        const matched = matchesPatternFilter(pattern, searchTerm);
        setVisibility(row, matched);
        if (matched) { count++; }
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
    renderPatternsList();
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
    renderPatternsList();
    addLogEntry('Pattern deleted', LOG_TYPE_SYSTEM);
}

/**
 * Exports the current patterns configuration to a file.
 * @returns {void}
 */
function exportPatterns() {
    const config = {
        version: "1.0",
        device: "BrainBit 2",
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
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `eeg-patterns-${config.exported}.yaml`;
    anchor.click();
    URL.revokeObjectURL(url);

    addLogEntry('Configuration exported as YAML', LOG_TYPE_SUCCESS);
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

            renderPatternsList();
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
    renderPatternsList();
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

    renderPatternsList();
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

    renderPatternsList();
    executePattern(pattern, metricValue, eeg);
    renderPatternsList();
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
    try {

        switch (actionType) {
            case ACTION_TYPE_JS: executeJSAction(pattern, eeg); break;
            case ACTION_TYPE_URL: executeUrlAction(pattern, eeg); break;
            case ACTION_TYPE_SDK: executeSDKAction(pattern, eeg); break;
            case ACTION_TYPE_UDP: executeUDPAction(pattern), eeg; break;
            case ACTION_TYPE_SHELL: executeShellAction(pattern, eeg); break;
            case ACTION_TYPE_SOCKET: executeSocketAction(pattern, eeg); break;
            case ACTION_TYPE_MQTT: executeMqttAction(pattern, eeg); break;
            default: throw new Error(`Unknown action type: ${actionType}`);
        }

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
        if (now - pattern.lastTriggered < pattern.cooldown * 1000) return;

        // Get recent samples within duration window
        const durationMs = pattern.condition.duration * 1000;
        const recentSamples = eeg.filter(d => now - d.timestamp <= durationMs);

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