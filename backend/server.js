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

  let accumulatedData = '';

  ws.on('open', function open() {
    ws.send(prompt);
  });

  ws.on('message', function message(data) {
    accumulatedData += data.toString(); // Accumulate data
    console.log('Accumulated data so far:', accumulatedData);
  });

  ws.on('close', function close() {
    const htmlData = RRML2HTML(accumulatedData); // Process accumulated data
    onData(htmlData);
    console.log('Final accumulated data:', accumulatedData);
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
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