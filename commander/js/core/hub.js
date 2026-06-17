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
 * This script handles hub functionality.
 */

const WS_READYSTATE_OPENING = 0;
const WS_READYSTATE_OPEN = 1;
const WS_READYSTATE_CLOSING = 2;
const WS_READYSTATE_CLOSED = 3;

let hubClient;
/**
 * Sends data to a central WebSocket server hub
 * @param {*} data 
 */
function sendToHub(data) {

    if (!hubClient) return;

    const deviceId = (isSimulating) ? `simulation-${clientUNID}` : deviceInfo ? `${deviceInfo.name}-${deviceInfo.deviceId}` : 'Unknown';
    const id = `${config.hub.id}-${deviceId}`;

    if (hubClient.readyState === WS_READYSTATE_CLOSED) {
        initHubClient();
    } else if (hubClient.readyState === WS_READYSTATE_OPEN) {
        hubClient.send(JSON.stringify({ id, ...data }));
    }
}

/**
 * Initializes the hub socket
 */
function initHubClient() {
    const hubHost = config.hub.host;
    if (isEmpty(hubHost)) return;

    hubClient = new WebSocket(hubHost);
    hubClient.onopen = () => {

        hubClient.onmessage = (event) => {
            console.log('Hub event: ' + event.data)
        };
    };

    hubClient.onerror = (err) => {
        console.error('Failed in hub server: ' + err.message)
        hubClient.close();
    };
}