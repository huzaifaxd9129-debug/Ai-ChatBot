require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, Events } = require("discord.js"); // Added Events
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const AI_CHANNEL_ID = "1502814146943520809";
const cooldown = new Map();

// --- FIXED GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We are switching to 'gemini-2.5-flash' which is the 2026 stable standard
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    systemInstruction: "You are a helpful Discord AI assistant. Keep replies short and friendly."
});

// --- FIXED DISCORD READY EVENT ---
// Changed 'ready' to Events.ClientReady to fix the DeprecationWarning
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot is live as ${c.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot || msg.channel.id !== AI_CHANNEL_ID) return;

  const prompt = msg.content.trim();
  if (!prompt) return;

  // Cooldown Logic
  if (cooldown.has(msg.author.id)) return msg.react("⏳");
  cooldown.set(msg.author.id, true);
  setTimeout(() => cooldown.delete(msg.author.id), 5000);

  await msg.channel.sendTyping();

  try {
    // Calling the updated model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    await msg.reply(text.slice(0, 2000));
  } catch (err) {
    console.error("AI Error:", err);
    // This usually happens if the API Key is wrong or the model name changed again
    msg.reply("❌ API Error: Check your Railway Variables for GEMINI_API_KEY.");
  }
});

client.login(process.env.TOKEN);
