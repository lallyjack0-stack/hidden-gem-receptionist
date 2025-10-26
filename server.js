import express from "express";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const port = process.env.PORT || 3000;

// --- Create a shared HTTP server for both Express and WebSocket ---
const server = http.createServer(app);

// --- WebSocket server (Twilio Media Stream) ---
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔗 Twilio connected to media stream");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.event === "start") {
        console.log("🎙️ Stream started from Twilio");
      } else if (data.event === "media") {
        const audioChunk = data.media.payload;
        console.log(`🎧 Received audio chunk (${audioChunk.length} bytes)`);
      } else if (data.event === "stop") {
        console.log("🛑 Stream stopped");
      } else {
        console.log("📩 Other event:", data.event);
      }
    } catch (err) {
      console.error("⚠️ Error parsing message:", err);
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
    url: `wss://${req.headers.host}`, // use Render’s domain
    track: "both_tracks", // capture both caller + callee audio
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// --- Start combined Express + WebSocket server ---
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server and WebSocket running on port ${port}`);
});




