const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();

let gridMapping = {};
const history = [];

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', ws => {
  // Send the current grid mapping to the new client
  ws.send(JSON.stringify(gridMapping));

  // Handle incoming messages from clients
  ws.on('message', message => {
    const data = JSON.parse(message);
    // Update the grid mapping with the received data
    gridMapping = data;
    history.push(data);

    // Broadcast the updated mapping to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(gridMapping));
      }
    });
  });
});

app.get("/undo", (req, res) => {
    if(history.length > 0){
        history.pop();
        const result = history[history.length - 1] || {};
        console.log("here: ", result);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(result));
            }
        });
        return res.json("success");
    }
    return res.json("nothing to undo");
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});