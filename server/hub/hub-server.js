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
 * Hub Server.
 */
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import os from 'os';
import { getLocalIpAddress } from '../shared/network.js';

const config = loadConfig();
console.clear();
console.log('--------------------------------------------------------------');
console.log(`v${config.app} v${config.version}`);
console.log('--------------------------------------------------------------');
console.log(`Endpoint: http://${getLocalIpAddress()}:${config.port}`);
console.log('Hostname: ' + os.hostname());
console.log('--------------------------------------------------------------');

let clients = new Map();

const wss = new WebSocketServer({ port: config.port || 8885 });
wss.on('connection', (ws, req) => {

    ws.on('open', () => console.log("Server is up. Let's make some noise!."));
    ws.on('message', (data) => handleOnMessage(data, ws));
    ws.on('close', () => handleClientDisconnect(ws.deviceId));
});

/**
 * Handles the on message event
 * @param {*} data 
 * @param {*} ws 
 */
function handleOnMessage(data, ws) {
    const dataStr = data.toString();
        const message = JSON.parse(dataStr);
        const id = message.id;
        ws.deviceId = id;

        if (!fs.existsSync(config.logFolder)) {
            fs.mkdirSync(config.logFolder, { recursive: true });
        }

        let entry;
        if (!clients.has(id)) {

            const logFilePath = path.join(config.logFolder, `eeg-${id}-${createFileDateFormat()}.csv`);
            const file = fs.createWriteStream(logFilePath, { flags: 'a' }) // 'a' = append

            entry = { messages: [], socket: ws, file: file };
            clients.set(id, entry);
            file.write(`timestamp, ch1, ch2, ch3, ch4\n`)
            addLogEntry(`Client connected: ${ws.deviceId} | Registered clients: ${clients.size}`);

        } else {
            entry = clients.get(id);
        }

        entry.messages.push(message);
        entry.file.write(`${message.timestamp},${message.ch1},${message.ch2},${message.ch3},${message.ch4}\n`);
}

/**
 * Removes the client from the list, closes its file
 * @param {*} id 
 */
function handleClientDisconnect(id) {
    if (id) {
        clients.get(id).file.close();
        clients.delete(id);
        addLogEntry(`Client disconnected: ${id} | Registered clients: ${clients.size}`);
    }
}
/**
 * Creates a file name friendly date format
 * @param {*} date 
 * @returns {string} A date in a file name friendly format
 */
function createFileDateFormat(date = new Date()) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format: 2025-06-17_19-45-33
    const dateFormat = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return dateFormat;
}

/**
 * Logs a message
 * @param {*} id
 * @param {*} message 
 * @param {*} logType 
 */
function addLogEntry(message, logType = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${logType.toUpperCase()}] ${message}`);
}

/**
 * Loads and returns a configuration
 * @returns {Object} The configuration
 */
function loadConfig() {
    const content = fs.readFileSync('config.json', 'utf8');
    return JSON.parse(content);
}