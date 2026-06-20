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
 * This script handles executing actions.
 */

const BEARER_DEMO_API_KEY = 'Bearer Demo-API-Key';

const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';

const ACTION_DEFAULT_TIMEOUT = 5; // seconds
const ACTION_DEFAULT_REPLIES = 1; // seconds

const HTTP_HEADER_AUTHORIZATION = 'Authorization';
const HTTP_HEADER_CONTENT_TYPE = 'Content-Type';
const HTTP_HEADER_CONTENT_TYPE_JSON = 'application/json';

/**
 * Executes a UDP action by sending a request to a Shell Server, which then sends the UDP message. This is done to bypass browser restrictions on UDP.
 * @param {*} pattern The pattern object containing the action with the UDP configuration.
 * @param eeg
 * @returns {void}
 */
async function executeUDPAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");
    if (isEmpty(pattern.action.payload.message)) throw new Error("Pattern action payload message is null or empty");

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const payload = pattern.action.payload;
    let response = [];

    const settings = {
        method: HTTP_METHOD_POST,
        headers: {},
        body: JSON.stringify({ command: pattern.action.payload, type: ACTION_TYPE_UDP, sender: pattern.name })
    };
    settings.headers[HTTP_HEADER_AUTHORIZATION] = BEARER_DEMO_API_KEY;
    settings.headers[HTTP_HEADER_CONTENT_TYPE] = HTTP_HEADER_CONTENT_TYPE_JSON;

    try {
        const response = await fetch(config.shell.host + '/execute', settings);
        const data = await response.json();
        if (response.ok) {
            addResponse(task, pattern, data);
        } else {
            addResponse(task, pattern, null, (response.statusText || data || `Unknown error (${response.status})`));
        }

    } catch (e) {
        const message = `Failed to send message to ${payload.host}:${payload.port} Error: ${e.message}`;
        addResponse(task, pattern, null, message);
    }
}

/**
 * Executes a MQTT action by connecting to the specified host and sending a message. It also listens for responses and logs them.
 * @param {*} pattern The pattern object containing the action with the socket configuration.
 * @param eeg
 * @returns {void}
 */
function executeMqttAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");
    if (isEmpty(pattern.action.payload.host)) throw new Error("Pattern action payload host is null or empty");
    if (isEmpty(pattern.action.payload.topic)) throw new Error("Pattern action payload topic is null or empty");
    if (isEmpty(pattern.action.payload.quality)) throw new Error("Pattern action payload quality is null or empty");
    if (isEmpty(pattern.action.payload.message)) throw new Error("Pattern action payload message is null or empty");
    if (isEmpty(pattern.action.payload.timeout)) pattern.action.payload.timeout = ACTION_DEFAULT_TIMEOUT;
    if (isEmpty(pattern.action.payload.replies)) pattern.action.payload.replies = 0;
    // Value definition for the replies property, 0 = fire-and-forget, 1 = single reply, 5 = collect up to 5, or timeout.

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const payload = pattern.action.payload;
    let response = [];
    let timeout = false;
    let done = false;

    const topic = payload.topic;
    const quality = payload.quality;
    const message = getAsString(payload.message);
    const clientId = 'browser-' + Math.random().toString(16).substr(2, 8);

    let client = mqtt.connect(payload.host, {
        clientId: clientId,
        clean: true,
        reconnectPeriod: 1000,
    });

    client.on('connect', () => {

        client.subscribe(topic, (err) => {
            if (err) {
                const error = `Failed to subscribe to topic (${topic}) on MQTT: ${payload.host}: ${err.message}`;
                addResponse(task, pattern, null, error);
                if (client && client.connected) {
                    client.end();
                    client = null;
                }
            } else {

                client.publish(topic, message, { qos: quality }, (err) => {
                    if (err) {
                        addResponse(task, pattern, null, `Failed to publish message (${message}) in (${topic}) on MQTT: ${payload.host}: ${err.message}`);
                        if (client && client.connected) { client.end(); client = null; }
                    }
                });
            }
        });

    });

    client.on('message', (topic, message) => {
        const msg = message.toString();
        response.push(msg);

        if (payload.replies > 0) {

            const connectionTimeout = setTimeout(() => {
                //clearTimeout(connectionTimeout);
                timeout = true;
                if (!done) {
                    done = true;
                    addResponse(task, pattern, null, "Timeout: No replies received within timeout.");
                    if (client && client.connected) { client.end(); client = null; }
                }
            }, payload.timeout * 1000);

        } else {
            // If no replies expected, just close after timeout to clean up resources, and log that message was sent.
            done = true;
            addResponse(task, pattern, response.length > 1 ? response : response[0]);
            if (client && client.connected) { client.end(); client = null; }
        }

        if (response.length === payload.replies) {
            //clearTimeout(connectionTimeout);
            if (!done && !timeout) {
                done = true;
                addResponse(task, pattern, response.length > 1 ? response : response[0]);
                if (client && client.connected) { client.end(); client = null; }
            }
        }
    });

    client.on('error', (err) => {
        clearTimeout(connectionTimeout);
        done = true;
        const error = `Failed to connect to MQTT: ${payload.host}`;
        addResponse(task, pattern, null, error);
        if (client && client.connected) { client.end(); client = null; }
    });

    client.on('close', () => console.log('🔌 Connection closed'));
}

/**
 * Executes a web socket action by connecting to the specified socket server and sending a message. It also listens for responses and logs them.
 * @param {*} pattern The pattern object containing the action with the socket configuration.
 * @param eeg
 * @returns {void}
 */
function executeSocketAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");
    if (isEmpty(pattern.action.payload.host)) throw new Error("Pattern action payload host is null or empty");
    if (isEmpty(pattern.action.payload.message)) throw new Error("Pattern action payload message is null or empty");
    if (isEmpty(pattern.action.payload.timeout)) pattern.action.payload.timeout = ACTION_DEFAULT_TIMEOUT;
    if (isEmpty(pattern.action.payload.replies)) pattern.action.payload.replies = 0;
    // Value definition for the replies property, 0 = fire-and-forget, 1 = single reply, 5 = collect up to 5, or timeout.

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const payload = pattern.action.payload;
    let response = [];

    let timeout = false;
    let done = false;
    const ws = new WebSocket(payload.host);
    ws.onopen = () => {
        ws.send(JSON.stringify(payload.message));

        if (payload.replies > 0) {

            const connectionTimeout = setTimeout(() => {
                clearTimeout(connectionTimeout);
                timeout = true;
                if (!done) {
                    done = true;
                    addResponse(task, pattern, null, "Timeout: No replies received within timeout");
                    ws.close();
                }
            }, payload.timeout * 1000);

            ws.onmessage = (event) => {
                response.push(event.data);

                if (response.length === payload.replies) {
                    //clearTimeout(connectionTimeout);
                    if (!done && !timeout) {
                        done = true;
                        addResponse(task, pattern, response.length > 1 ? response : response[0]);
                        ws.close();
                    }
                }
            };

        } else {
            // If no replies expected, just close after timeout to clean up resources, and log that message was sent.
            done = true;
            addResponse(task, pattern, response.length > 1 ? response : response[0]);
            ws.close();
        }
    };

    let errorMsg = null;
    ws.onerror = (err) => {
        //clearTimeout(connectionTimeout);
        done = true;
        addResponse(task, pattern, null, `Failed to connect to WebSocket: ${payload.host}`);
        ws.close();
    };
}

/**
 * Executes an SDK action. In this simulation, it just logs the function call. In a real implementation, this would interface with the BrainBit Web SDK.
 * @param {*} pattern The pattern object containing the action with the SDK configuration.
 * @param eeg
 * @returns {void}
 */
function executeSDKAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const fnName = pattern.action.payload || 'injectMarker';
    const result = `SDK call: ${fnName}`;

    // Special handling for marker
    if (fnName.includes('injectMarker')) {
        //addLogEntry(`${getPatternLogId(pattern)} Marker injected (value=42)`, ACTION_TYPE_SDK);
    }
    addResponse(taskSuccess(task), pattern, result);
}

/**
 * Executes a JavaScript pattern.
 * @param {*} pattern The pattern object containing the action with the JavaScript code to execute. 
 * @param eeg
 * @returns {void}
 */
async function executeJSAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const payload = pattern.action.payload;

    let result;
    if (payload.startsWith("./") || isValidUrl(payload)) {

        // The payload is a url to the .js file to execute
        try {
            const code = await loadUrl(payload);
            result = runJS(code, eeg);

        } catch (e) {
            const message = `Failed to execute JS action (${payload}): ${e.message}`;
            addResponse(task, pattern, null, `${message}`);
            return;
        }

    } else {

        // The payload is a text with all the JS code
        try {
            result = runJS(payload, eeg);

        } catch (e) {
            const message = `Failed to execute JS action: ${e.message}`;
            addResponse(task, pattern, null, message);
            return;
        }
    }
    const output = (typeof result === 'undefined') ? '(no return value)' : getAsString(result);
    addResponse(task, pattern, output);
}

/**
 * Executes a shell command, by sending a request to a Shell Server.
 * @param {string} pattern
 * @param {*} eeg
 * @returns {Promise<void>}
 */
async function executeShellAction(pattern, eeg) {

    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");
    if (isEmpty(pattern.action.payload.host)) throw new Error("Pattern action payload host is null or empty");
    if (isEmpty(pattern.action.payload.command)) throw new Error("Pattern action payload command is null or empty");

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const settings = {
        method: HTTP_METHOD_POST,
        headers: {},
        body: JSON.stringify({ command: pattern.action.payload.command, type: ACTION_TYPE_SHELL, sender: pattern.name })
    }
    settings.headers[HTTP_HEADER_AUTHORIZATION] = BEARER_DEMO_API_KEY;
    settings.headers[HTTP_HEADER_CONTENT_TYPE] = HTTP_HEADER_CONTENT_TYPE_JSON;

    const response = await fetch(pattern.action.payload.host + '/execute', settings);
    const data = await response.json();
    if (response.ok) {
        addResponse(task, pattern, data.stdout || data.stderr || '[no output]');
    } else {
        addResponse(task, pattern, null, response.statusText || 'Unknown error');
    }
}

/**
 * Executes a URL action by sending an HTTP request.
 * @param {*} pattern
 * @param {*} eeg
 * @returns {Promise<void>}
 */
async function executeUrlAction(pattern, eeg) {
    if (isEmpty(pattern)) throw new Error("Pattern is null or empty");
    if (isEmpty(pattern.name)) throw new Error("Pattern name is null or empty");
    if (isEmpty(pattern.action)) throw new Error("Pattern action is null or empty");
    if (isEmpty(pattern.action.payload)) throw new Error("Pattern action payload is null or empty");
    if (isEmpty(pattern.action.payload.method)) throw new Error("Pattern action payload method is null or empty");
    if (isEmpty(pattern.action.payload.url)) throw new Error("Pattern action payload url is null or empty");

    const task = taskStarted({ pattern: pattern, eeg: eeg });
    const payload = pattern.action.payload;

    const settings = {
        method: payload.method || HTTP_METHOD_GET,
        headers: {}
    };

    if (payload.authorization) { settings.headers[HTTP_HEADER_AUTHORIZATION] = payload.authorization; }
    if (payload.contentType) { settings.headers[HTTP_HEADER_CONTENT_TYPE] = payload.contentType; }
    if (payload.body && payload.method === HTTP_METHOD_POST) { settings.body = getAsString(payload.body); }

    try {
        const response = await fetch(payload.url, settings);
        if (!response.ok) {
            const httpStatus = getHttpStatusMessage(response.status);
            const message = `Failed to ${payload.method} ${payload.url}: Error ${httpStatus.statusCode} - ${httpStatus.message}`;
            addResponse(task, pattern, null, message);
            return;
        }

        const data = await response.json();
        addResponse(task, pattern, data);

    } catch (e) {
        addResponse(task, pattern, null, `Failed to ${payload.method} ${payload.url}: Error ${e.message}`);
    }
}

/**
 * Runs the JS code and returns the value returned by the code
 * @param {*} code 
 * @param eeg
 * @returns {object} Depends on what the code return, if any
 */
function runJS(code, eeg) {
    const fn = new Function(['eeg'], code);
    return fn(eeg);
}

/**
 * Calculates a metric value for a set of EEG samples.
 * @param {*} samples 
 * @param {*} channel 
 * @param {*} metric 
 * @returns {void}
 */
function getMetricValue(samples, channel, metric) {
    if (!samples.length) return 0;

    let values = [];

    samples.forEach(s => {
        switch (channel) {
            case 'avg': values.push((s.ch1 + s.ch2 + s.ch3 + s.ch4) / 4); break;
            case 'any': values.push(Math.max(Math.abs(s.ch1), Math.abs(s.ch2), Math.abs(s.ch3), Math.abs(s.ch4))); BroadcastChannel; break;
            case 'ch1': values.push(s.ch1); break;
            case 'ch2': values.push(s.ch2); break;
            case 'ch3': values.push(s.ch3); break;
            case 'ch4': values.push(s.ch4); break;
            default: throw new Error(`Unknown channel id ${channel}`)
        }
    });

    switch (metric) {
        case 'peak': return Math.max(...values.map(v => Math.abs(v)));
        case 'moving_avg_abs':
            const absVals = values.map(v => Math.abs(v));
            return absVals.reduce((a, b) => a + b, 0) / absVals.length;
        default: return values.reduce((sum, v) => sum + Math.abs(v), 0) / values.length;
    }
}
