import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import twilio from "twilio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Twilio webhook ---
app.post("/voice", (req, res) => {
  console.log("📞 /voice endpoint was called by Twilio");
  const response = new twilio.twiml.VoiceResponse();
  const connect = response.connect({ region: "us1" });
  connect.stream({
    url: "wss://hidden-gem-receptionist.fly.dev",
    track: "both_tracks",
  });
  res.type("text/xml");
  res.send(response.toString());
});

// --- Health check route ---
app.get("/", (req, res) => {
  res.status(200).send("✅ Hidden Gem Receptionist is live");
});

// --- Create HTTP + WebSocket server ---
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("🔗 Twilio connected to WebSocket:", req.socket.remoteAddress);
  ws.on("message", (msg) => console.log("🎧 Received message:", msg.length, "bytes"));
  ws.on("close", () => console.log("❌ Twilio WebSocket closed"));
  ws.on("error", (err) => console.error("⚠️ WebSocket error:", err));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});






