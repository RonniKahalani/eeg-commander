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

let currentEditingId = null;

/**
 * This contains the modal dialogs
 */
class PatternDialog {

    constructor() {
        this.patternModal = byId('pattern-modal');
    }

    /**
     * Open the modal dialog
     */
    open() {
        setVisibility(this.patternModal, true);
    }

    /**
     * Closes the modal dialog
     */
    close() {
        currentEditingId = null;
        setVisibility(this.patternModal, false);
    }

    /**
     * Toggles visibility for the POST/GET and body section
     * @param {*} method 
     */
    handleUrlMethodSection(method) {
        setVisibility(byId('action-url-body-section'), (method === 'POST'));
    }

    /**
     * Saves a new pattern or updates an existing one based on the modal form inputs.
     * @returns {void}
     */
    savePattern() {

        const actionType = patternActionTypeElem.value;
        let actionPayload = '';

        // TODO: Add the missing cases for UDP and Socket actions
        switch (actionType) {

            case ACTION_TYPE_JS: actionPayload = this.updateJSPattern(); break;
            case ACTION_TYPE_SHELL: actionPayload = this.updateShellPattern(); break;
            case ACTION_TYPE_URL: actionPayload = this.updateURLPattern(); break;
            case ACTION_TYPE_SDK: actionPayload = this.updateSDKPattern(); break;
            case ACTION_TYPE_UDP: actionPayload = this.updateUDPPattern(); break;
            case ACTION_TYPE_SOCKET: actionPayload = this.updateSocketPattern(); break;
            case ACTION_TYPE_MQTT: actionPayload = this.updateMQTTPattern(); break;
            default: throw new Error(`Unknown action type: ${actionType}`);
        }

        const newPattern = {
            id: currentEditingId || ('p' + Date.now()),
            name: patternNameElem.value.trim() || 'Unnamed Pattern',
            alias: patternAliasElem.value.trim() || 'Unnamed Alias',
            description : patternDescriptionElem.value.trim() || '',
            enabled : patternEnabledElem.checked,
            condition: { 
                channel: patternConditionChannelElem.value, 
                metric: (patternConditionChannelElem.value === 'any' ? 'peak' : 'moving_avg_abs'), 
                operator: patternConditionOperatorElem.value, 
                threshold: parseInt(patternConditionThresholdElem.value), 
                duration: parseInt(patternConditionDurationElem.value) 
            },
            action: { 
                type: actionType, 
                payload: actionPayload 
            },
            cooldown: parseInt(patternConditionCooldownElem.value) || 5,
            lastTriggered: 0,
            triggerCount: currentEditingId ? (findPattern(currentEditingId)?.triggerCount || 0) : 0
        };

        if (currentEditingId) {
            // Update existing
            const idx = patterns.findIndex(p => p.id === currentEditingId);
            patterns[idx] = newPattern;
            addLogEntry(`Pattern "${name}" updated`, LOG_TYPE_SYSTEM);
        } else {
            patterns.push(newPattern);
            addLogEntry(`New pattern "${name}" created`, LOG_TYPE_SUCCESS);
        }

        this.close();
        renderPatternsList();

        // Auto-save to localStorage as backup
        localStorage.setItem(LOCAL_STORAGE_PATTERNS, JSON.stringify(patterns));
    }

    /**
     * Displays the modal for adding a new pattern or editing an existing one.
     * @returns {void}
     */
    addPattern() {
        currentEditingId = null;
        byId('modal-pattern-title').textContent = 'Create New Pattern';
        byId('modal-save-btn').textContent = 'Create Pattern';

        // Reset form
        byId('pattern-name').value = 'Pattern ' + (patterns.length + 1);
        byId('pattern-alias').value = 'alias-' + (patterns.length + 1);
        byId('pattern-description').value = '';
        byId('condition-channel').value = 'avg';
        byId('condition-operator').value = '>';
        byId('condition-threshold').value = '35';
        byId('condition-duration').value = '2.0';
        byId('condition-cooldown').value = '5';
        byId('pattern-enabled').checked = true;

        byId('action-type').value = ACTION_TYPE_JS;
        byId('action-js-code').value = '';

        this.updateActionFields();
        this.open();
    }

    /**
     * Edits an existing pattern.
     * @param {*} id 
     * @returns {void}
     */
    editPattern(id) {
        const pattern = findPattern(id);
        if (!pattern) return;

        currentEditingId = id;
        byId('modal-pattern-title').textContent = 'Edit Pattern';
        byId('modal-save-btn').textContent = 'Save';

        // Populate form
        byId('pattern-name').value = pattern.name;
        byId('pattern-alias').value = pattern.alias;
        byId('pattern-description').value = pattern.description || '';
        byId('condition-channel').value = pattern.condition.channel;
        byId('condition-operator').value = pattern.condition.operator;
        byId('condition-threshold').value = pattern.condition.threshold;
        byId('condition-duration').value = pattern.condition.duration;
        byId('condition-cooldown').value = pattern.cooldown || 5;
        byId('pattern-enabled').checked = pattern.enabled;

        byId('action-type').value = pattern.action.type;

        // Set action specific fields
        switch (pattern.action.type) {
            case ACTION_TYPE_SHELL:
                byId('action-shell-host').value = pattern.action.payload.host || '';
                byId('action-shell-command').value = pattern.action.payload.command || '';
                break;
            case ACTION_TYPE_URL:
                const p = pattern.action.payload || {};
                byId('action-url-method').value = p.method || 'POST';
                byId('action-url-url').value = p.url || '';
                byId('action-url-authorization').value = p.authorization || '';
                byId('action-url-contentType').value = p.contentType || '';
                byId('action-url-body').value = getAsString(p.body);
                break;
            case ACTION_TYPE_SDK:
                byId('action-sdk-function').value = pattern.action.payload || 'injectMarker';
                break;
            case ACTION_TYPE_JS:
                byId('action-js-code').value = pattern.action.payload || '';
                break;
            case ACTION_TYPE_UDP:
                byId('action-udp-host').value = pattern.action.payload?.host || '';
                byId('action-udp-port').value = pattern.action.payload?.port || '';
                byId('action-udp-message').value = getAsString(pattern.action.payload.message);
                byId('action-udp-timeout').value = pattern.action.payload?.timeout || '';
                byId('action-udp-replies').value = pattern.action.payload?.replies || '';
                break;
            case ACTION_TYPE_SOCKET:
                byId('action-socket-host').value = pattern.action.payload?.host || '';
                byId('action-socket-message').value = getAsString(pattern.action.payload.message);
                byId('action-socket-timeout').value = pattern.action.payload?.timeout || '';
                byId('action-socket-replies').value = pattern.action.payload?.replies || '';
                break;

            case ACTION_TYPE_MQTT:
                byId('action-mqtt-host').value = pattern.action.payload?.host || '';
                byId('action-mqtt-message').value = getAsString(pattern.action.payload.message);
                byId('action-mqtt-topic').value = pattern.action.payload.topic;
                byId('action-mqtt-quality').value = pattern.action.payload.quality;
                byId('action-mqtt-timeout').value = pattern.action.payload?.timeout || '';
                byId('action-mqtt-replies').value = pattern.action.payload?.replies || '';
                break;

        }

        this.updateActionFields();
        this.open();
    }

    /**
     * Updates the action fields in the modal dialog based on the selected action type.
     * @returns {void}
     */
    updateActionFields() {
        const type = byId('action-type').value;

        document.querySelectorAll('.action-panel').forEach(el => el.classList.add('hidden'));

        let clazz;
        switch (type) {
            case ACTION_TYPE_JS: clazz = 'action-js'; break;
            case ACTION_TYPE_SHELL: clazz = 'action-shell'; break;
            case ACTION_TYPE_URL: clazz = 'action-url'; break;
            case ACTION_TYPE_SDK: clazz = 'action-sdk'; break;
            case ACTION_TYPE_UDP: clazz = 'action-udp'; break;
            case ACTION_TYPE_SOCKET: clazz = 'action-socket'; break;
            case ACTION_TYPE_MQTT: clazz = 'action-mqtt'; break;
            default: throw new Error(`Unknown action type: ${type}`);
        }

        byId(clazz).classList.remove('hidden');
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateJSPattern() {
        return byId('action-js-code').value.trim();
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateShellPattern() {
        return {
            host: byId('action-shell-host').value.trim(),
            command: byId('action-shell-command').value.trim()
        }
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateURLPattern() {
        return {
            method: byId('action-url-method').value.trim(),
            url: byId('action-url-url').value.trim(),
            authorization: byId('action-url-authorization').value.trim(),
            contentType: byId('action-url-contentType').value.trim(),
            body: byId('action-url-body').value.trim()
        };
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateSDKPattern() {
        const fn = byId('action-sdk-function').value;
        return (fn === 'custom') ? byId('action-sdk-custom').value.trim() : fn;
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateUDPPattern() {
        return {
            host: byId('action-udp-host').value.trim(),
            port: parseInt(byId('action-udp-port').value) || 0,
            message: byId('action-udp-message').value.trim(),
            timeout: parseFloat(byId('action-udp-timeout').value) || 5,
            replies: parseInt(byId('action-udp-replies').value) || 1
        };
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateSocketPattern() {
        return {
            host: byId('action-socket-host').value.trim(),
            message: byId('action-socket-message').value.trim(),
            timeout: parseFloat(byId('action-socket-timeout').value) || 5,
            replies: parseInt(byId('action-socket-replies').value) || 1
        };
    }

    /**
     * Returns the data to be updated
     * @returns {object}
     */
    updateMQTTPattern() {
        return {
            host: byId('action-mqtt-host').value.trim(),
            message: byId('action-mqtt-message').value.trim(),
            topic: byId('action-mqtt-topic').value.trim(),
            quality: byId('action-mqtt-quality').value.trim(),
            timeout: parseFloat(byId('action-mqtt-timeout').value) || 5,
            replies: parseInt(byId('action-mqtt-replies').value) || 1
        };
    }
}

/**
 * Handles the response dialog
 */
class ResponseDialog {

    constructor() {
        this.responseModal = byId('response-modal');

    }

    open() {
        setVisibility(this.responseModal, true);
    }

    close() {
        setVisibility(this.responseModal, false);
    }
}

const patternDialog = new PatternDialog();
const responseDialog = new ResponseDialog();