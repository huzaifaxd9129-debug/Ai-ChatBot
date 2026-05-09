require("dotenv").config();

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- DISCORD SETUP ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const AI_CHANNEL_ID = "1502814146943520809";
const cooldown = new Map();

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-1.5-flash for speed and low cost
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful Discord AI assistant. Keep replies short, clean, and friendly."
});

// ================= READY =================
client.once("ready", () => {
  console.log(`🤖 Gemini AI Bot online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "👑 Made By Huztro",
        type: ActivityType.Playing
      }
    ],
    status: "dnd"
  });
});

// ================= AI CHAT =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // ✅ Only specific channel
  if (msg.channel.id !== AI_CHANNEL_ID) return;

  // ✅ Anti-spam cooldown (5 sec per user)
  if (cooldown.has(msg.author.id)) {
    return msg.react("⏳").catch(() => {});
  }

  cooldown.set(msg.author.id, true);
  setTimeout(() => cooldown.delete(msg.author.id), 5000);

  const prompt = msg.content.trim();
  if (!prompt) return;

  await msg.channel.sendTyping();

  try {
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text() || "❌ No response";

    // Discord char limit check
    await msg.reply(reply.slice(0, 2000));

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    msg.reply("❌ Gemini AI error — check API key or quota");
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
