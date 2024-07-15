const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

function connectToRichieRichWebSocket(prompt, onData, onError, onEnd) {
  const ws = new WebSocket('ws://localhost:8082/v1/stream');

  ws.on('open', function open() {
    ws.send(prompt);
  });

  ws.on('message', function message(data) {
    const newWord = data.toString();
    const htmlData = RRML2HTML(newWord); // Process only new data
    console.log('New data:', newWord);
    console.log('HTML data:', htmlData);
    onData(htmlData);
  });

  ws.on('close', function close() {
    console.log('WebSocket connection closed.');
    onEnd();
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
    onError(err);
  });

  return ws;
}

app.get("/api/chat", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const prompt = req.query.prompt;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  const ws = connectToRichieRichWebSocket(
    prompt,
    (data) => {
      res.write(`data: ${data}\n\n`);
    },
    (error) => {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    },
    () => {
      res.write(`event: end\ndata: \n\n`);
      res.end();
    }
  );

  req.on('close', () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
