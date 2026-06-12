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
 * Handles security routines 
 */
const fs = require('fs');
const path = require('path');

let config = null;

/**
 * Loads the security configuration from a JSON file. If the file cannot be read or parsed, it falls back to a default configuration with safe settings.
 * @param {*} configPath 
 * @returns {Object} The loaded configuration object, or a default config if loading fails.
 */
function loadConfig(configPath = path.join(__dirname, 'config.json')) {
  try {

    const content = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(content);
    console.log('Security config loaded from', configPath);
    return config;

  } catch (err) {
    console.error('Failed to load config.json:', err.message);
    return config;
  }
}

/**
 * Checks if a command is in the allowed list.
 * @param {string} command - The command to check.
 * @returns {boolean} True if the command is allowed, false otherwise.
 */
function isCommandAllowed(command) {
  if (!config) loadConfig();
  const cmd = command.trim().split(/\s+/)[0]; // first word
  const allowedCommands = config.allowed?.commands || [];
  return allowedCommands.includes(cmd) || allowedCommands.includes(command.trim());
}

/**
 * Checks if a command contains any dangerous patterns.
 * @param {string} command - The command to check.
 * @returns {boolean} True if a dangerous pattern is detected, false otherwise.
 */
function hasDangerousPattern(command) {
  if (!config) { loadConfig(); }
  
  const patterns = config.blocked_patterns || [];
  
  return patterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(command);
  });
}

/**
 * Checks if a host is in the allowed list.
 * @param {string} host - The host to check.
 * @returns {boolean} True if the host is allowed, false otherwise.
 */
function isHostAllowed(host) {
  if (!config) loadConfig();
  if (!host) return false;
  const allowed = config.allowed?.hosts || [];
  return allowed.some(h => host.includes(h));
}

/**
 * Checks if the request is allowed, by validating the referer or origin is in the allowed list.
 * @param {object} req - The request to check.
 * @returns {boolean} True if the request is allowed.
 */
function isRequestAllowed(req) {

  if (!config) loadConfig();
  const referer = req.headers.referer;
  const origin = req.headers.origin;

  const allowed = config.allowed.origins || [];
  const sources = [referer, origin].filter(Boolean);
  if (sources.length === 0) return true; // allow if no referer (e.g. curl)
  return sources.some(src => allowed.some(r => src.startsWith(r)));
}

/**
 * Checks if an API key is valid.
 * @param {string} key - The API key to check.
 * @returns {boolean} True if the API key is valid, false otherwise.
 */
function isValidApiKey(key) {
  if (!config) loadConfig();
  const keys = config.api_keys || [];
  return keys.includes(key);
}

/**
 * Checks if a request is secure based on its headers and the provided command.
 * @param {Object} req - The request object.
 * @param {string} command - The command to check.
 * @returns {Object} An object indicating whether the request is allowed and the reason.
 */
function isRequestSecure(req, command) {
  const host = req.headers.host || '';
  const auth = req.headers.authorization || '';
  const apiKey = auth.replace('Bearer ', '');

  // 1. API Key check (if keys are defined)
  if (config.api_keys && config.api_keys.length > 0) {
    if (!isValidApiKey(apiKey)) {
      return { allowed: false, reason: 'Invalid or missing API Key' };
    }
  }

  // 2. Host check
  if (!isHostAllowed(host)) {
    return { allowed: false, reason: `Host not allowed: ${host}` };
  }

  // 3. Origin and referer check
  if (!isRequestAllowed(req)) {
    return { allowed: false, reason: 'Origin not allowed' };
  }

  // 4. Command allowlist check
  if (!isCommandAllowed(command)) {
    return { allowed: false, reason: `Command is not allowed: ${command}` };
  }

  // 5. Dangerous pattern check
  if (hasDangerousPattern(command)) {
    return { allowed: false, reason: 'Suspicious pattern detected not allowed' };
  }

  return { allowed: true };
}

/**
 * Exports the security functions for use in other modules.
 */
module.exports = {
  loadConfig,
  isCommandAllowed,
  hasDangerousPattern,
  isHostAllowed,
  isRequestAllowed,
  isValidApiKey,
  isRequestSecure
};