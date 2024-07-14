const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

function connectToRichieRichWebSocket(prompt, onData) {
  const ws = new WebSocket('ws://localhost:8082/v1/stream');

  ws.on('open', function open() {
    ws.send(prompt);
  });

  ws.on('message', function message(data) {
    const dataString = data.toString(); // Convert Buffer to string
    console.log('Received data from WebSocket:', dataString);
    const htmlData = RRML2HTML(dataString);
    onData(htmlData);
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });

  ws.on('close', function close() {
    console.log('WebSocket connection closed');
  });
}

app.get("/api/chat", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const prompt = req.query.prompt;

  connectToRichieRichWebSocket(prompt, (data) => {
    res.write(`data: ${data}\n\n`);
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});