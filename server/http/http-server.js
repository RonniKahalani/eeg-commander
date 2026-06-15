const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Collect request body
  let body = [];
  
  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', () => {
    body = Buffer.concat(body).toString();

    // Prepare echo response
    const response = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: body || null,
      timestamp: new Date().toISOString(),
      query: Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams),
    };

    // Set response headers
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Echo-Server': 'Node.js'
    });

    // Send the echo
    res.end(JSON.stringify(response, null, 2));
  });
});

// Handle common HTTP methods explicitly (though the handler above works for all)
server.on('request', (req, res) => {
  // This is just for logging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Echo server running on http://localhost:${PORT}`);
  console.log('It accepts GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, etc.');
  console.log('\nTest it with:');
  console.log(`curl -X POST http://localhost:${PORT}/test -d '{"message": "hello"}' -H "Content-Type: application/json"`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
});