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
 * WebSocket Server.
 */
import { WebSocketServer } from 'ws';
import os from 'os';
import { getLocalIpAddress } from '../shared/network.js';

const VERSION = '1.0.0';
const PORT = 8889;
const wss = new WebSocketServer({ port: PORT });

console.clear();
console.log('--------------------------------------------------------------');
console.log(`WebSocket Server v${VERSION}`);
console.log('--------------------------------------------------------------');
console.log(`Endpoint: http://${getLocalIpAddress()}:${PORT}`);
console.log('Hostname: ' + os.hostname());
console.log('--------------------------------------------------------------');


wss.on('connection', (ws, req) => {

    const clientIP = req.socket.remoteAddress;

    ws.on('open', () => {
        console.log("Server is up. Let's make some noise!.");
    });

    ws.on('message', (data) => {

        const message = data.toString();
        try {
            addLogEntry(clientIP, message, 'info');

            // Echo back confirmation
            ws.send(message);

        } catch (e) {
            addLogEntry(clientIP, e.message, 'error');
        }
    });

    ws.on('close', () => {
        // TODO: Handle client disconnect if needed
    });
});

/**
 * Logs a message
 * @param {*} id
 * @param {*} message 
 * @param {*} logType 
 */
function addLogEntry(id, message, logType = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${logType.toUpperCase()}] [${id.replaceAll('http://', '').replaceAll('https://', '')}] ${message}`);
}