const cron = require("node-cron");
const { differenceInHours } = require("date-fns");

const tasks = [];

const addCommand = (runner, cronStr, ...args) => {
  const cronExp = cronStr.replace(/-/g, " ");
  if (!cron.validate(cronExp)) {
    runner.send("Invalid syntax");
    return;
  }

  const commandStr = args.join(" ");
  const taskObj = { cron: cronExp, command: commandStr, lastExecution: null };
  taskObj.task = cron.schedule(cronExp, () => {
    const diff = differenceInHours(taskObj.lastExecution, new Date(), {roundingMethod: 'floor'});
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
  });
  tasks.push(taskObj);
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
  tasks.splice(index, 1);
  runner.send(`Stopped command: \`${taskObj.command}\``);
};

module.exports = {
  addCommand,
  listCommands,
  removeCommand,
};
