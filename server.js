import express from "express";
import twilio from "twilio";
import { WebSocketServer } from "ws";

const app = express();
const port = 3000;

// --- WebSocket server (for Twilio media stream) ---
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("🔗 Twilio connected to media stream");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.event === "media") {
      const audioChunk = data.media.payload;
      // later you'll send this to your AI / ElevenLabs
    }
  });

  ws.on("close", () => console.log("❌ Twilio disconnected"));
});

// --- Express webhook for Twilio Voice ---
app.post("/voice", (req, res) => {
  console.log("📞 /voice endpoint was called by Twilio");

  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  connect.stream({ url: "wss://unwindowed-subvesicular-lu.ngrok-free.dev" });
  res.type("text/xml");
  res.send(twiml.toString());
});

// --- Start Express server ---
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

