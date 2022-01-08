const Discord = require("discord.js");
const { Client, Intents } = Discord;

const { token } = require("./config.json");
const { loadTasksFromDB, tasks } = require("./src/commands/autocmd");
const { createCommandRunner } = require("./src/commands/commands");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS],
});

client.once("ready", async () => {
  console.log("Random bot is online");
  await loadTasksFromDB(client);
  console.log(`Loaded tasks from DB: ${tasks.length}`);
});

client.on("message", async (message) => {
  if (!message.content.match(new RegExp(`^\\${prefix}[a-z]`)) || message.author.bot) return;

  const runner = createCommandRunner(message);
  await runner.runCommand(message.content.slice(prefix.length));
});

client.login(token);
