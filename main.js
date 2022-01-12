const { Client, Intents } = require('discord.js');

const { token, prefix } = require("./config.json");
const { loadTasksFromDB, tasks } = require("./src/commands/autocmd");
const { createCommandRunner } = require("./src/command-runner");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS],
});

client.once("ready", async () => {
  console.log("Random bot is online");
  await loadTasksFromDB(client, createCommandRunner);
  console.log(`Loaded tasks from DB: ${tasks.length}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.match(new RegExp(`^\\${prefix}[a-z]`)) || message.author.bot) return;

  const runner = createCommandRunner(message);
  await runner.runCommand(message.content.slice(prefix.length));
});

client.login(token);
