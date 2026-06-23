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
 * Shell Server
 * 
 * A simple HTTP server that listens for shell command execution requests and returns the output.
 */
const dgram = require('dgram');
const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const security = require('./security');

let config = null;

const VERSION = '1.0.0';

const ACTION_TYPE_UDP = 'udp';
const ACTION_TYPE_SHELL = 'shell';

/**
 * Sets secure CORS headers for the response
 * @param {*} req 
 * @param {*} res 
 * @return {void}
 */
function setSecureCorsHeaders(req, res) {

    if (security.isRequestAllowed(req)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    } else {
        // For disallowed origins, do not set the header (browser will block)
        // You could also set it to 'null' explicitly
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Vary', 'Origin');

    // Security headers (bonus)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
}

// === END CORS CONFIG ===

/**
 * Main HTTP server to handle shell command execution and system info requests
 */
const server = http.createServer((req, res) => {
    // Apply secure CORS headers to ALL responses
    setSecureCorsHeaders(req, res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    res.setHeader('Content-Type', 'application/json');

    const isCommandRequest = req.method === 'POST' && req.url === '/execute';
    const isUsageRequest = req.method === 'GET' && req.url === '/';
    const isHealthRequest = req.method === 'GET' && req.url === '/health';
    const isSystemRequest = req.method === 'GET' && req.url === '/system';
    const isEchoRequest = req.url === '/echo';

    if (isCommandRequest) {
        let action = '';
        req.on('data', chunk => action += chunk.toString());
        req.on('end', () => handleCommand(JSON.parse(action || '{}'), req, res));
    } else if (isUsageRequest) {
        handleUsage(req, res);
    } else if (isHealthRequest) {
        handleHealth(req, res);
    } else if (isSystemRequest) {
        handleSystem(req, res);
    } else if (isEchoRequest) {
        let action = '';
        req.on('data', chunk => action += chunk.toString());
        req.on('end', () => handleEcho(JSON.parse(action || '{}'), req, res));       
    } else { handleNotFound(req, res); }
});

/**
 * Handles the execution of commands received via POST request
 * @param {*} action 
 * @param {*} req 
 * @param {*} res 
 */
function handleCommand(action, req, res) {

    if (action === null || action === undefined || action === '') throw new Error("Action is null or empty");

    switch (action.type) {
        case "shell": handleShellCommand(action, req, res); break;
        case "udp": handleUDPCommand(action, req, res); break;
        default:
            res.writeHead(400);
            res.end(JSON.stringify({
                error: 'Invalid action type. Expected "shell" or "udp".'
            }));
    }
}

/**
 * Checks if a property is empty (null, undefined, or empty string)
 * @param {*} property 
 * @returns {boolean} True if the property is empty, false otherwise
 */
function isEmpty(property) {
    return property === null || property === undefined || property === '';
}

/**
 * Handles the execution of UDP commands received via POST request
 * @param {*} action 
 * @param {*} req 
 * @param {*} res
 * @return {void}
 */
function handleUDPCommand(action, req, res) {

    if (isEmpty(action)) throw new Error("Action is null or empty");
    if (isEmpty(action.command.message)) throw new Error("Action command message is null or empty");
    if (isEmpty(action.command.host)) throw new Error("Action command host is null or empty");
    if (isEmpty(action.command.port)) throw new Error("Action command port is null or empty");
    if (isEmpty(action.command.timeout)) action.command.timeout = DEFAULT_TIMEOUT; // default timeout in seconds
    if (isEmpty(action.command.replies)) action.command.replies = 0;
    // default to not expecting replies, 0 = fire-and-forget, 1 = single reply, 5 = collect up to 5, or timeout.

    const client = dgram.createSocket('udp4');
    const buffer = Buffer.from(JSON.stringify(action.command.message));
    let response = [];

    let timeout = false;
    let done = false;
    let error;
    try {

        client.send(buffer, 0, buffer.length, action.command.port, action.command.host, (e) => {
            if (e) {
                done = true;
                handleError(e.message, req, res);
                addLogEntry(req, action.sender, `${action.command.host}:${action.command.port} ${e.message}`, 'error', ACTION_TYPE_UDP);
            } else {

                if (action.command.replies > 0) {

                    const connectionTimeout = setTimeout(() => {
                        clearTimeout(connectionTimeout);
                        timeout = true;

                        if (!done) {
                            done = true;
                            closeClient(client);
                            handleError("Timeout", req, res);
                            addLogEntry(req, action.sender, `${action.command.host}:${action.command.port} Timeout`, 'error', ACTION_TYPE_UDP);
                        }
                    }, action.command.timeout * 1000);

                    client.on('message', (msg, rinfo) => {
                        response.push(msg.toString());

                        if (response.length === action.command.replies) {
                            clearTimeout(connectionTimeout);
                            if (!done && !timeout) {
                                done = true;
                                closeClient(client);
                                const message = (response.length > 1) ? JSON.stringify(response) : response[0];
                                handleSuccess(message, req, res);
                                addLogEntry(req, action.sender, `${action.command.host}:${action.command.port} - Message: ${message}`, 'info', ACTION_TYPE_UDP);
                            }
                        }
                    });

                } else {
                    // If no replies expected, just close after timeout to clean up resources, and log that message was sent.
                    closeClient(client);
                    done = true;
                    const message = (response.length > 1) ? JSON.stringify(response) : response[0];
                    handleSuccess(message, req, res);
                    addLogEntry(req, action.sender, `${action.command.host}:${action.command.port} - Message: ${message}`, 'info', ACTION_TYPE_UDP);
                }
            }
        });

    } catch (e) {
        done = true;
        const message = `Failed to send message to ${action.command.host}:${action.command.port} - Error: ${e.message}`;
        handleError(message, req, res);
        addLogEntry(req, action.sender, message, 'error', ACTION_TYPE_UDP);
    }
}

/**
 * Checks if the client is open, if so it will be closed
 * @param {*} client 
 * @returns {void}
 */
function closeClient(client) {
    if (!client) { return; }
    const isClosed = client._handle === null
    if (!isClosed) { client.close(); }
}

/**
 * Handles the response for a failed request
 * @param {*} message 
 * @param {*} req 
 * @param {*} res 
 * @param {*} client 
 * @returns {void}
 */
function handleError(message, req, res, httpCode = 500) {
    res.writeHead(httpCode);
    res.end(JSON.stringify(message));
}

/**
 * Handles the response for a succesful request
 * @param {*} message 
 * @param {*} req 
 * @param {*} res 
 * @param {*} client 
 * @returns {void}
 */
function handleSuccess(message, req, res, httpCode = 200) {
    res.writeHead(httpCode);
    res.end(JSON.stringify(message));
}

/**
 * Handles the execution of shell commands received via POST request
 * @param {*} action 
 * @param {*} req 
 * @param {*} res 
 * @returns {void}
 */
function handleShellCommand(action, req, res) {

    if (isEmpty(action)) throw new Error("Action is null or empty");
    if (isEmpty(action.command)) throw new Error("Action command is null or empty");

    try {
        const command = action.command;

        // Validate command presence
        if (!isCommandAvailable(command)) {
            res.writeHead(400);
            return res.end(JSON.stringify({
                error: 'Missing or invalid "command" (must be a non-empty string)'
            }));
        }

        // === SECURITY CHECK ===
        const securityCheck = security.isRequestSecure(req, command);
        if (!securityCheck.allowed) {
            addLogEntry(req, action.sender, `[SECURITY] Blocked command: "${command}" - Reason: ${securityCheck.reason}`, 'warn');
            res.writeHead(403);

            return res.end(JSON.stringify({
                error: 'Command blocked by security policy',
                reason: securityCheck.reason,
                command: command
            }));

            return;
        }

        addLogEntry(req, action.sender, command, 'info', 'shell');

        // Execute with timeout and buffer limit for safety
        exec(command, {
            timeout: config.exec.timeout * 1000, // convert seconds to milliseconds
            maxBuffer: 1024 * 1024 * config.exec.output, // limit output to configured MB
            cwd: process.cwd()        // run in current working dir
        }, (error, stdout, stderr) => {
            const response = {
                command: command,
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: error ? (error.code || 1) : 0,
                error: error ? error.message : null,
                timestamp: new Date().toISOString()
            };

            res.writeHead(200);
            res.end(JSON.stringify(response));
        });
    } catch (parseError) {
        res.writeHead(400);
        res.end(JSON.stringify({
            error: 'Invalid JSON body. Expected format: { command: "your shell command here", type: "the command type (shell or udp)", sender: "name of the action"  }',
            example: { command: "ls -la", type: "shell", sender: "Relaxation High" },
        }));
    }
}

/**
 * Logs a message with a timestamp and type (info, shell, error)
 * @param {*} req 
 * @param {*} id
 * @param {*} message 
 * @param {*} logType 
 * @param {*} actionType
 */
function addLogEntry(req, id, message, logType = 'info', actionType = 'system') {
    const timestamp = new Date().toISOString();
    const actionType5Long = actionType.toUpperCase();
    console.log(`[${timestamp}] [${logType.toUpperCase()}] [${req.headers.origin?.toString().replaceAll('http://', '').replaceAll('https://', '')}] [${id}] [${actionType5Long}] ${message}`);
}

/**
 * Generates a unique identifier based on the current timestamp and a random component.
 * @returns 
 */
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Checks if a command is available (not null, undefined, or empty).
 * @param {string} command - The command to check.
 * @returns {boolean} True if the command is available, false otherwise.
 */
function isCommandAvailable(command) {
    return command && typeof command === 'string' && command.trim() !== '';
}

/**
 * Converts bytes to gigabytes (GB)
 * @param {number} bytes 
 * @returns {string} The equivalent value in GB, formatted to 2 decimal places
 */
function toGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

/**
 * Gathers detailed system information about the current process and environment, including:
 * - Hostname, platform, architecture, OS release, uptime, CPU info (model, speed, times)
 * - Memory usage (total, free, used, usage percent)
 * - Node.js version, V8 version, process ID, parent process ID, exec path
 * @param {*} req 
 * @param {*} res
 * @return {void} 
 */
function handleSystem(req, res) {

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

    const systemInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),

        cpus: os.cpus().map(cpu => ({
            model: cpu.model,
            speed: cpu.speed + " MHz",
            times: cpu.times
        })),

        memory: {
            total: toGB(totalMem),
            free: toGB(freeMem),
            used: toGB(usedMem),
            usagePercent: parseFloat(memUsagePercent)
        },

        uptime: {
            systemSeconds: os.uptime(),
            systemHuman: (os.uptime() / 3600).toFixed(1) + " hours",
            processSeconds: process.uptime(),
            processHuman: (process.uptime() / 60).toFixed(1) + " minutes"
        },

        node: {
            version: process.version,
            v8: process.versions.v8,
            pid: process.pid,
            ppid: process.ppid,
            execPath: process.execPath
        },

        current: {
            cwd: process.cwd(),
            user: os.userInfo().username,
            homedir: os.homedir()
        },

        network: Object.entries(os.networkInterfaces()).map(([name, interfaces]) => ({
            interface: name,
            addresses: interfaces.map(i => ({
                address: i.address,
                family: i.family,
                internal: i.internal
            }))
        })),

        loadavg: os.loadavg(),
        tmpdir: os.tmpdir(),
        endianness: os.endianness(),
        type: os.type()
    };

    res.writeHead(200);
    res.end(JSON.stringify(systemInfo, null, 2));
}

/**
 * Handles the GET / endpoint
 * @param {*} req 
 * @param {*} res
 * @return {void} 
 */
function handleUsage(req, res) {
    const localIp = getLocalIpAddress() || 'localhost';

    res.writeHead(200);
    res.end(JSON.stringify({
        message: 'Shell Server API.',
        description: 'Executes shell commands and returns stdout, stderr, and exit code.',
        endpoint: 'POST /execute',
        body_format: {
            command: 'string (required) - The full shell command to execute, e.g. "ls -la" or "echo hello world"'
        },
        usage_examples: [
            `curl -X POST http://${localIp}:${port}/execute -H "Content-Type: application/json" -d \'{"command": "echo Hello from Node.js"}\'`,
            `curl -X POST http://${localIp}:${port}/execute -H "Content-Type: application/json" -d \'{"command": "ls -la /home/workdir"}\'`,
            `curl -X POST http://${localIp}:${port}/execute -H "Content-Type: application/json" -d \'{"command": "node --version"}\'`
        ],
        warnings: [
            'This endpoint executes arbitrary shell commands. Use with caution.',
            'Commands are limited to 30 seconds and 10MB output.',
            'No command injection protection beyond Node.js defaults.'
        ]
    }, null, 2));
}

/**
 * Handles the GET /health endpoint
 * @param {*} req 
 * @param {*} res 
 * @return {void} 
 */
function handleHealth(req, res) {
    res.writeHead(200);
    res.end(JSON.stringify({
        hostname: os.hostname(),
        status: 'healthy',
        uptime: process.uptime()
    }));
}

/**
 * Handles echo endpoint
 * @param {*} action 
 * @param {*} req 
 * @param {*} res 
 * @return {void} 
 */
function handleEcho(action, req, res) {
    res.writeHead(200);
    res.end(JSON.stringify(action));
}

/**
 * Handles the 404 Not Found endpoint
 * @param {*} req 
 * @param {*} res 
 * @return {void}
 */
function handleNotFound(req, res) {

    const message = (req.method === 'GET' && req.url === '/execute') ? 'You have to use a POST request for the /execute endpoint.' : 'Endpoint not found.';
    res.writeHead(404);
    res.end(JSON.stringify({
        error: message,
        available_endpoints: ['GET /', 'GET /health', 'GET /system', 'POST /execute']
    }));
}

/**
 * Retrieves the local IP address of the machine.
 * @returns {string|null} The local IP address or null if not found.
 */
function getLocalIpAddress() {
    const nets = os.networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    return results['Wi-Fi']?.[0] || results['Ethernet']?.[0] || 'localhost';
}

/**
 * Starts the HTTP server on the specified port and logs the available endpoints and version information to the console.
 */
config = security.loadConfig();
const port = process.env.PORT || config.port || 3000;
server.listen(port, '0.0.0.0', () => {
    console.clear();
    console.log('--------------------------------------------------------------');
    console.log(`Shell Server v${config.version}`);
    console.log('--------------------------------------------------------------');
    console.log(`Endpoint: http://${getLocalIpAddress()}:${port}`);
    console.log('Hostname: ' + os.hostname());
    console.log('');
    console.log('Endpoints:');
    console.log('GET / - API info and usage');
    console.log('GET /health - Health check');
    console.log('GET /system - System information');
    console.log('POST /execute - Execute a shell command');
    console.log('* /echo - Echo response');        
    console.log('--------------------------------------------------------------');
    console.log("Server is up. Let's make some noise!.");
});