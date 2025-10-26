import express from "express";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const port = process.env.PORT || 3000;

// --- Create a single HTTP server that Express and WebSocket share ---
const server = http.createServer(app);

// --- WebSocket server (attached to same HTTP server for Render) ---
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  // Allow Twilio's websocket upgrade
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

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
      console.error("⚠️ Error parsing WS message:", err);
    }
  });

  ws.on("close", () => console.log("❌ Twilio disconnected"));
});

// --- Twilio Voice Webhook ---
app.all("/voice", (req, res) => {
  console.log("📞 /voice endpoint was called by Twilio");

  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  connect.stream({
    url: `wss://${req.headers.host}/`, // use same Render domain (HTTPS → WSS)
    track: "both_tracks",
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// --- Start everything on the same port ---
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server + WebSocket running on port ${port}`);
});






