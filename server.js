import express from "express";
import twilio from "twilio";
import { WebSocketServer } from "ws";

const app = express();

// --- WebSocket server (for Twilio media stream) ---
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("🔗 Twilio connected to media stream");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.event === "start") {
        console.log("🎙️ Stream started from Twilio");
      } else if (data.event === "media") {
        console.log(`🎧 Received audio chunk (${data.media.payload.length} bytes)`);
      } else if (data.event === "stop") {
        console.log("🛑 Stream stopped");
      }
    } catch (err) {
      console.error("❌ Error parsing media stream message:", err);
    }
  });

  ws.on("close", () => console.log("❌ Twilio disconnected"));
});

// --- Express webhook for Twilio Voice ---
app.post("/voice", (req, res) => {
  console.log("📞 /voice endpoint was called by Twilio");

  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  connect.stream({ url: "wss://hidden-gem-receptionist.fly.dev" }); // same domain as app
  res.type("text/xml");
  res.send(twiml.toString());
});

// --- Start Express server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});









