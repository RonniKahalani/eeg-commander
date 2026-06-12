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
 * UDP Client.
 */
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const SERVER_HOST = '127.0.0.1';   // Change to drone IP if needed
const SERVER_PORT = 8888;

function sendCommand(message) {
    const buffer = Buffer.from(message);
    
    client.send(buffer, 0, buffer.length, SERVER_PORT, SERVER_HOST, (err) => {
        if (err) {
            console.error("❌ Error sending:", err);
        } else {
            console.log(`📤 Sent: ${message}`);
        }
    });
}

// Test commands
console.log("UDP Client ready. Sending test commands every 4 seconds...\n");

let count = 0;
setInterval(() => {
    const commands = [
        "takeoff",
        "move forward 50",
        "land",
        "flip left"
    ];
    
    const cmd = commands[count % commands.length];
    sendCommand(cmd);
    count++;
}, 4000);

// Receive responses
client.on('message', (msg, rinfo) => {
    console.log(`📥 Server reply from ${rinfo.address}:${rinfo.port} → ${msg.toString()}`);
});

client.on('error', (err) => {
    console.error(`❌ Client error: ${err.message}`);
});