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
      switch (statusCode) {
        case 100: message = "Continue"; break;
        case 101: message = "Switching Protocols"; break;
        case 102: message = "Processing"; break;
        case 103: message = "Early Hints"; break;
        default: message = "Informational Response";
      }
      break;

    // ==================== SUCCESS (2xx) ====================
    case statusCode >= 200 && statusCode < 300:
      category = "Success";
      switch (statusCode) {
        case 200: message = "OK"; break;
        case 201: message = "Created"; break;
        case 202: message = "Accepted"; break;
        case 204: message = "No Content"; break;
        case 206: message = "Partial Content"; break;
        default: message = "Success";
      }
      break;

    // ==================== REDIRECTION (3xx) ====================
    case statusCode >= 300 && statusCode < 400:
      category = "Redirection";
      switch (statusCode) {
        case 301: message = "Moved Permanently"; break;
        case 302: message = "Found"; break;
        case 304: message = "Not Modified"; break;
        case 307: message = "Temporary Redirect"; break;
        case 308: message = "Permanent Redirect"; break;
        default: message = "Redirection";
      }
      break;

    // ==================== CLIENT ERRORS (4xx) ====================
    case statusCode >= 400 && statusCode < 500:
      category = "Client Error";
      switch (statusCode) {
        case 400: message = "Bad Request"; break;
        case 401: message = "Unauthorized"; break;
        case 403: message = "Forbidden"; break;
        case 404: message = "Not Found"; break;
        case 405: message = "Method Not Allowed"; break;
        case 408: message = "Request Timeout"; break;
        case 409: message = "Conflict"; break;
        case 410: message = "Gone"; break;
        case 413: message = "Payload Too Large"; break;
        case 415: message = "Unsupported Media Type"; break;
        case 429: message = "Too Many Requests"; break;
        default: message = "Client Error";
      }
      break;

    // ==================== SERVER ERRORS (5xx) ====================
    case statusCode >= 500 && statusCode < 600:
      category = "Server Error";
      switch (statusCode) {
        case 500: message = "Internal Server Error"; break;
        case 501: message = "Not Implemented"; break;
        case 502: message = "Bad Gateway"; break;
        case 503: message = "Service Unavailable"; break;
        case 504: message = "Gateway Timeout"; break;
        case 505: message = "HTTP Version Not Supported"; break;
        default: message = "Server Error";
      }
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