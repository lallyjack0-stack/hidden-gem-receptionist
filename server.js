import express from "express";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const port = process.env.PORT || 3000;

// --- Create HTTP server for both Express and WebSocket ---
const server = http.createServer(app);

// --- WebSocket server (same port as Express) ---
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔗 Twilio connected to media stream");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.event === "media") {
      const audioChunk = data.media.payload;
      // you'll stream this to AI later
    }
  });

  ws.on("close", () => console.log("❌ Twilio disconnected"));
});

// --- Express webhook for Twilio Voice ---
app.all("/voice", (req, res) => {
  console.log("📞 /voice endpoint was called by Twilio");

  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  connect.stream({
    url: `wss://${req.headers.host}`, // same host as Render app
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// --- Start combined server ---
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server and WebSocket running on port ${port}`);
});



