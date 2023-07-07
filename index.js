const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store the grid mapping
let gridMapping = {};

// Handle WebSocket connections
wss.on('connection', ws => {
  // Send the current grid mapping to the new client
  ws.send(JSON.stringify(gridMapping));

  // Handle incoming messages from clients
  ws.on('message', message => {
    const data = JSON.parse(message);

    // Update the grid mapping with the received data
    gridMapping = data;

    // Broadcast the updated mapping to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(gridMapping));
      }
    });
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});