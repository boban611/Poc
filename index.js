const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

let gridMapping = {};
const history = [];

const guests = [];
const msgs = [];

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', ws => {
  // Send the current grid mapping to the new client
  ws.send(JSON.stringify({
    type: 'grid',
    msg: gridMapping
  }));
  ws.send(JSON.stringify({
    type: 'msg',
    msg: msgs
  }))
  guests.push(ws);

  // Handle incoming messages from clients
  ws.on('message', message => {
    const data_obj = JSON.parse(message);
    if (data_obj?.type === "msg") {

      console.log("here: ", data_obj);
      //messages stack
      const index = guests.findIndex(item => item === ws);
      const msg = {
        guestIndex: index,
        msg: data_obj.msg
      }
      msgs.push(msg);

      const data = {
        type: 'msg',
        msg: msgs
      }
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
    if (data_obj?.type === 'grid') {
      // Update the grid mapping with the received data
      gridMapping = data_obj.msg;
      history.push(data_obj.msg);

      // Broadcast the updated mapping to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'grid',
            msg: gridMapping
          }));
        }
      });
    }


  });
});

app.get("/undo", (req, res) => {
  if (history.length > 0) {
    history.pop();
    const result = history[history.length - 1] || {};
    console.log("here: ", result);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'grid',
          msg: result
        }));
      }
    });
    return res.json("success");
  }
  return res.json("nothing to undo");
});

// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, "public/index.html"))
// });

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});