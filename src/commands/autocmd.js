const cron = require("node-cron");

const tasks = [];

const addCommand = (runner, cronStr, ...args) => {
  const cronExp = cronStr.replace(/-/g, " ");
  console.log(cronExp);
  if (!cron.validate(cronExp)) {
    runner.send("Invalid syntax");
    return;
  }

  if (cronExp.trim().startsWith("* *") && process.env.NODE_ENV === "prod") {
    runner.send("STOP, YOU SPAMMER!");
    return;
  }

  const commandStr = args.join(" ");
  const task = cron.schedule(cronExp, () => {
    const now = new Date().toISOString();
    console.log(`[${now}] Running command: ${cronExp} - ${commandStr}`);
    runner.runCommand(commandStr);
  });
  tasks.push({ task, cron: cronExp, command: commandStr });
  runner.send(`Scheduled command: \`${commandStr}\` with \`${cronExp}\``);
};

const listCommands = (runner) => {
  const list = tasks.map((t, i) => `${i}: ${t.cron} - ${t.command}`).join("\n");
  runner.send(list || "No auto commands");
};

const removeCommand = (runner, id) => {
  const index = parseInt(id);

  if (isNaN(index) || index < 0 || index >= tasks.length) {
    runner.send("Invalid id");
    return;
  }

  const taskObj = tasks[index];
  taskObj.task.stop();
  runner.send(`Stopped command: \`${taskObj.command}\``);
};

module.exports = {
  addCommand,
  listCommands,
  removeCommand,
};
