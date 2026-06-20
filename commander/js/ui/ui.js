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
 * Triggers an easter egg action
 * @param {*} event 
 */
function doEasterEgg(event) {
    if (patterns.length > 0) {
        const index = Math.floor(Math.random() * patterns.length);
        const random = patterns[index];

        triggerPattern(random, random.condition.threshold + 15);
        addLogEntry('Random test triggered', LOG_TYPE_SYSTEM);
    }
}

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

    responseDetailsDataElem.innerHTML = isSuccess ? prettyFormatData(response.data) : '';
    responseDetailsErrorElem.innerHTML = !isSuccess ? response.error : '';
    responseDetailsIdElem.innerHTML = responseId;
    responseDetailsSuccessElem.innerHTML = isSuccess;
    responseDetailsStarttimeElem.innerHTML = new Date(response.task.startTime).toLocaleString();
    responseDetailsEndtimeElem.innerHTML = new Date(response.task.endTime).toLocaleString();
    responseDetailsJsonElem.innerHTML = isJSON;

    setVisibility(responseDetailsDataElem, isSuccess);
    setVisibility(responseDetailsErrorElem, !isSuccess);

    const modal = byId('response-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Updates the Events UI
 */
function renderEvents(responsesToRender = null, elem = null) {

    if (responsesToRender === null) {
        responsesToRender = responses;
    }

    if (elem === null) {
        elem = responsesListElem;
    }

    elem.innerHTML = '';

    responsesToRender.forEach((response, index) => {

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

        elem.innerHTML = responseHtml + elem.innerHTML;
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
 * Renders the list of defined patterns.
 * @param {Array} patternsToRender
 * @param {Object} elem
 * @returns {void}
 */
function renderPatterns(patternsToRender = null, elem = null) {

    if (patternsToRender === null) {
        patternsToRender = patterns;
    }

    if (elem === null) {
        elem = patternsListElem;
    }

    elem.innerHTML = '';

    if (!patternsToRender.length) {
        elem.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">No patterns defined yet.<br>Click "New Pattern" to begin.</div>`;
        return;
    }

    let count = 0;
    patternsToRender.forEach(pattern => {

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

        elem.appendChild(div);
        filterPatterns();
        patternFilterCountElem.innerHTML = ++count;
        patternCountElem.innerHTML = count;
    });
}
