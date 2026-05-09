require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful Discord AI assistant. Keep replies short and friendly." 
});

const AI_CHANNEL_ID = "1502814146943520809";

client.once("ready", () => {
  console.log(`✅ Bot is live on Railway as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "👑 Made By Huztro", type: ActivityType.Playing }],
    status: "dnd"
  });
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || msg.channel.id !== AI_CHANNEL_ID) return;

  const prompt = msg.content.trim();
  if (!prompt) return;

  await msg.channel.sendTyping();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    await msg.reply(response.text().slice(0, 2000));
  } catch (err) {
    console.error("AI Error:", err);
    msg.reply("❌ Brain freeze! Check Railway logs.");
  }
});

client.login(process.env.TOKEN);
