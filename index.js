require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { OpenAI } = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 PUT YOUR CHANNEL ID HERE
const AI_CHANNEL_ID = "1499921455260106832";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ================= READY =================
client.once("ready", () => {
  console.log(`🤖 AI Bot online as ${client.user.tag}`);
});

// ================= AI CHAT =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // ❌ ignore other channels
  if (msg.channel.id !== AI_CHANNEL_ID) return;

  const prompt = msg.content.trim();
  if (!prompt) return;

  await msg.channel.sendTyping();

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful Discord AI assistant. Reply naturally, short and clear."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const reply = res.choices[0].message.content;

    msg.reply(
      reply.length > 2000 ? reply.slice(0, 2000) : reply
    );

  } catch (err) {
    console.log(err);
    msg.reply("❌ AI error occurred");
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
