const { createCommands } = require("./commands/commands");
const { prefix } = require('../config.json');
const { addCommand, listCommands, removeCommand } = require("./commands/autocmd.js");
class CommandRunner {
  constructor(message, prefix, commands) {
    this.message = message;
    this.prefix = prefix;
    this.commands = commands;
  }

  send(obj) {
    if (typeof obj === 'string') {
      this.message.channel.send(obj);
    } else {
      this.message.channel.send({ embeds: [obj] });
    }
  }

  empty_arg(command) {
    this.message.channel.send(`Try using \`${this.prefix}${command} help\``);
  }

  async runCommand(commandStr) {
    const args = commandStr.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (Object.keys(this.commands).indexOf(command) === -1) {
      //If command doesn't exist
      const msg = `"${this.prefix}help"`;
      return this.message.channel.send(
        `This command doesn't exist. Try using ${msg}`
      );
    } else if (args.length === 0) {
      //If the arg is empty
      const missing_arg = this.commands[command]["_"];
      if (missing_arg) {
        return missing_arg(this, ...args.slice(1));
      } else {
        return this.empty_arg(command);
      }
    } else if (args[0].startsWith("<@")) {
      if (Object.keys(this.commands[command]).indexOf("at") !== -1) {
        const fn = this.commands[command]["at"];
        return fn();
      } else {
        return this.message.channel.send(
          `This argument doesn't exist. Try using \`${this.prefix}${command} help\``
        );
      }
    } else if (Object.keys(this.commands[command]).indexOf(args[0]) === -1) {
      //If the arg of a command doesn't exist
      return this.message.channel.send(
        `This argument doesn't exist. Try using \`${this.prefix}${command} help\``
      );
    } else {
      //Call command
      const call = this.commands[command][args[0]];
      return call(this, ...args.slice(1));
    }
  }
}

const createCommandRunner = (message) => {
  return new CommandRunner(message, prefix, createCommands(message));
}

module.exports = {
  CommandRunner,
  createCommandRunner,
};
