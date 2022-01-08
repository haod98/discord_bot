const cron = require("node-cron");
const { differenceInHours } = require("date-fns");
const { Low, JSONFile } = require('lowdb');
const { createCommandRunner } = require("./commands");
const { join } = require('path');

const file = join(__dirname, '../../db.json')
const adapter = new JSONFile(file);
const db = new Low(adapter);
db.data ||= { tasks: [] };

const tasks = [];

const addTask = (runner, data) => {
  const task = data;
  task.task = cron.schedule(data.cronExp, () => {
    const diff = differenceInHours(taskObj.lastExecution, new Date(), {
      roundingMethod: "floor",
    });
    if (taskObj.lastExecution != null && diff < 24) {
      const idx = tasks.findIndex((t) => t === taskObj);

      runner.send(
        `We don't spam people here. Commands can only run once a day.`
      );
      setTimeout(() => {
        if (idx !== -1) {
          removeCommand(runner, idx);
        } else {
          taskObj.task.stop();
          console.log(
            "Just stopping the task. Could not find task in the list."
          );
        }
      }, 1000);
      return;
    }

    taskObj.lastExecution = new Date();
    const now = new Date().toISOString();
    console.log(`[${now}] Running command: ${cronExp} - ${commandStr}`);
    runner.runCommand(commandStr);
  },
    { timezone: 'Europe/Vienna' },
  );

  tasks.push(taskObj);
};

const findMessageInChannel = async (client, channelId, messageId) => {
  const channel = await client.channels.fetch(channelId);
  return channel.messages.fetch(messageId);
}

const loadTasksFromDB = async (client) => {
  await db.read();
  return Promise.all(db.data.tasks.map(async task => {
    const message = await findMessageInChannel(client, task.channel, task.message);
    const runner = createCommandRunner(message);
    addTask(runner, task);
  }));
};

const updateTaskDB = async () => {
  db.data.tasks = tasks.map(task => ({ cron: task.cronExp, command: task.command, lastExecution: task.lastExecution, message: runner.message.id, channel: runner.message.channelId }));
  await db.write()
};

const addCommand = async (runner, cronStr, ...args) => {
  const cronExp = cronStr.replace(/-/g, " ");
  if (!cron.validate(cronExp)) {
    runner.send("Invalid syntax");
    return;
  }

  const commandStr = args.join(" ");
  addTask(runner, { cron: cronExp, command: commandStr, lastExecution: null, message: runner.message.id, channel: runner.message.channelId });
  await updateTaskDB();
  runner.send(`Scheduled command: \`${commandStr}\` with \`${cronExp}\``);
};

const listCommands = (runner) => {
  const list = tasks.map((t, i) => `${i}: ${t.cron} - ${t.command}`).join("\n");
  runner.send(list || "No auto commands");
};

const removeCommand = async (runner, id) => {
  const index = parseInt(id);

  if (isNaN(index) || index < 0 || index >= tasks.length) {
    runner.send("Invalid id");
    return;
  }

  const taskObj = tasks[index];
  taskObj.task.stop();
  tasks.splice(index, 1);
  await updateTaskDB();
  runner.send(`Stopped command: \`${taskObj.command}\``);
};

module.exports = {
  tasks,
  addCommand,
  listCommands,
  removeCommand,
  loadTasksFromDB,
};
