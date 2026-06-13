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
 * Get human-readable message for any HTTP status code
 * @param {number} statusCode - The HTTP status code
 * @returns {string} - Message + category
 */
function getHttpStatusMessage(statusCode) {
  let message = "";
  let category = "";

  switch (true) {
    // ==================== INFORMATIONAL (1xx) ====================
    case statusCode >= 100 && statusCode < 200:
      category = "Informational";
      message = getInformationalMessage(statusCode);
      break;

    // ==================== SUCCESS (2xx) ====================
    case statusCode >= 200 && statusCode < 300:
      category = "Success";
      message = getSuccessMessage(statusCode);
      break;

    // ==================== REDIRECTION (3xx) ====================
    case statusCode >= 300 && statusCode < 400:
      category = "Redirection";
      message = getRedirectionMessage(statusCode);
      break;

    // ==================== CLIENT ERRORS (4xx) ====================
    case statusCode >= 400 && statusCode < 500:
      category = "Client Error";
      message = getClientErrorMessage(statusCode);
      break;

    // ==================== SERVER ERRORS (5xx) ====================
    case statusCode >= 500 && statusCode < 600:
      category = "Server Error";
      message = getServerErrorMessage(statusCode);
      break;

    default:
      category = "Unknown";
      message = "Unknown Status Code";
  }

  return {
    statusCode: statusCode,
    message: message,
    category: category
  };
}

/**
 * Returns the informational message
 * @param {number} statusCode 
 * @returns {string}
 */
function getInformationalMessage(statusCode) {
        switch (statusCode) {
        case 100: return "Continue"; break;
        case 101: return "Switching Protocols"; break;
        case 102: return "Processing"; break;
        case 103: return "Early Hints"; break;
        default: return "Informational Response";
      }
}

/**
 * Returns the success message
 * @param {number} statusCode 
 * @returns {string}
 */
function getSuccessMessage(statusCode) {
switch (statusCode) {
        case 200: return "OK"; break;
        case 201: return "Created"; break;
        case 202: return "Accepted"; break;
        case 204: return "No Content"; break;
        case 206: return "Partial Content"; break;
        default: return "Success";
      }
}

/**
 * Returns the redirection message
 * @param {number} statusCode 
 * @returns {string}
 */
function getRedirectionMessage(statusCode) {
       switch (statusCode) {
        case 301: return "Moved Permanently"; break;
        case 302: return "Found"; break;
        case 304: return "Not Modified"; break;
        case 307: return "Temporary Redirect"; break;
        case 308: return "Permanent Redirect"; break;
        default: return "Redirection";
      }
}

/**
 * Returns the client error message
 * @param {number} statusCode 
 * @returns {string}
 */
function getClientErrorMessage(statusCode) {
  switch (statusCode) {
    case 400: return "Bad Request"; break;
    case 401: return "Unauthorized"; break;
    case 403: return "Forbidden"; break;
    case 404: return "Not Found"; break;
    case 405: return "Method Not Allowed"; break;
    case 408: return "Request Timeout"; break;
    case 409: return "Conflict"; break;
    case 410: return "Gone"; break;
    case 413: return "Payload Too Large"; break;
    case 415: return "Unsupported Media Type"; break;
    case 429: return "Too Many Requests"; break;
    default: return "Client Error";
  }
}

/**
 * Returns the server error message
 * @param {number} statusCode 
 * @returns {string}
 */
function getServerErrorMessage(statusCode) {
  switch (statusCode) {
    case 500: return "Internal Server Error";
    case 501: return "Not Implemented";
    case 502: return "Bad Gateway";
    case 503: return "Service Unavailable";
    case 504: return "Gateway Timeout";
    case 505: return "HTTP Version Not Supported";
    default: return "Server Error";
  }
}