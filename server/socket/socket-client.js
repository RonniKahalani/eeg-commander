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
 * Socket Client.
 */
import {WebSocket} from 'ws';

const ws = new WebSocket('ws://localhost:8889');

ws.on('open', () => {
    console.log('🔌 Connected to WebSocket Server');

    // Example messages you can send from BrainBit Commander
    const commands = [
        { command: "takeoff", reason: "high_focus" },
        { command: "move_forward", distance: 50 },
        { command: "land", reason: "stress_detected" }
    ];

    // Send a test command every 3 seconds
    let index = 0;
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const cmd = commands[index % commands.length];
            ws.send(JSON.stringify(cmd));
            console.log(`📤 Sent:`, cmd);
            index++;
        }
    }, 3000);
});

ws.on('message', (data) => {
    console.log('📥 Server replied:', JSON.parse(data));
});

ws.on('close', () => {
    console.log('❌ Connection closed');
});

ws.on('error', (err) => {
    console.error('❌ Error:', err.message);
});