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
 * UDP Server.
 */
import dgram from 'node:dgram';
import os from 'os';
import { getLocalIpAddress } from '../shared/network.js';

const VERSION = '1.0.0';
const PORT = 8888;
const HOST = '0.0.0.0';
const server = dgram.createSocket('udp4');

server.on('listening', () => {
    console.log("Server is up. Let's make some noise!.");
});

server.on('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log(`📥 Received from ${rinfo.address}:${rinfo.port} → ${message}`);

    // Send acknowledgment back
    server.send(message, rinfo.port, rinfo.address);
});

server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
    server.close();
});

// Start server
server.bind(PORT, HOST);
console.clear();
console.log('--------------------------------------------------------------');
console.log(`🚀 UDP Server v${VERSION}`);
console.log('--------------------------------------------------------------');
console.log(`Endpoint: http://${getLocalIpAddress()}:${PORT}`);
console.log('Hostname: ' + os.hostname());
console.log('--------------------------------------------------------------');