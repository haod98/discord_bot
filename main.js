const Discord = require("discord.js");
const { Client, Intents } = Discord;
const Anilist = require("./src/Anilist");
const Snoowrap = require("snoowrap");

const {
  prefix,
  token,
  dog_token,
  cat_token,
  reddit_clientId,
  reddit_clientSecret,
  reddit_password,
  reddit_username,
} = require("./config.json");
const fetch = require("node-fetch");
const { randomNumber } = require("./src/utils");
const { CommandRunner } = require("./src/commands");
const { randomAnime, randomPokemon } = require("./src/commands/random");
const { addCommand, listCommands, removeCommand } = require("./src/commands/autocmd");
const { help } = require("./src/commands/help");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const anilist = new Anilist(true);

const reddit = new Snoowrap({
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
  clientId: reddit_clientId,
  clientSecret: reddit_clientSecret,
  username: reddit_username,
  password: reddit_password,
});

client.once("ready", () => console.log("Random bot is online"));

client.on("message", (message) => {
  if (!message.content.match(new RegExp(`^\\${prefix}[a-z]`)) || message.author.bot) return;

  //API for animal facts
  const animal_fact = (command) => {
    fetch(
      `https://cat-fact.herokuapp.com/facts/random?animal_type=${command}&amount=1`
    )
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(data.text);
      });
  };

  //API for animal imgs
  const animal_img = (animal, token) => {
    fetch(`https://api.the${animal}api.com/v1/images/search?api_key=${token}`)
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(data[0].url);
        if (Object.keys(data[0].breeds).length !== 0) {
          message.channel.send(
            `This ${animal} breed is called: **${data[0].breeds[0].name}**`
          );
        }
      });
  };
  //If !me command is called
  const about_user = () => {
    message.channel.send(
      `${String.fromCodePoint(0x1f440)} Your Username is: **${message.author.username
      }** \n${String.fromCodePoint(0x1f194)} Your ID is: **${message.author.id
      }**`
    );
  };

  const get_avatar = () => {
    const tagged_user_id = message.mentions.users.toJSON()[0].id;
    const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
    const tagged_user = message.mentions.users.first();
    return message.channel.send(
      `Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`
    );
  };

  const postSketchDaily = async (runner) => {
    const submissions = await reddit
      .getSubreddit("SketchDaily")
      .getNew({ limit: 1 });
    if (submissions.length > 0) {
      runner.send(submissions[0].url);
    }
  };

  const createHelp = (key, cmds) => {
    return new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands[key].icon)} List of ${key} commands`
      )
      .setDescription(
        Object.keys(cmds).map((cmd) => {
          return `\`${prefix}${key} ${cmd}\` ${cmds[cmd]}`;
        }).join('\n')
      );
  };

  //List of commands with the args
  const commands = {
    help: {
      _: help,
    },
    cat: {
      fact: () => animal_fact("cat"),
      img: () => animal_img("cat", cat_token),
      icon: 0x1f63a,
      help: runner =>
        runner.send(createHelp("dog", {
          img: "for a random cat image",
          fact: "for a random cat fact",
        }))
    },
    dog: {
      fact: () => animal_fact("dog"),
      img: () => animal_img("dog", dog_token),
      icon: 0x1f436,
      help: runner =>
        runner.send(createHelp("dog", {
          img: "for a random dog image",
          fact: "for a random dog fact",
        })),
    },
    me: {
      _: about_user,
      icon: 0x1f194,
      help: runner =>
        runner.send(createHelp("me", {
          "": "for \n [_Your Username_] and [_Your unique ID from Discord_]",
        })),
    },
    avatar: {
      icon: 0x1f5bc,
      help: runner =>
        runner.send(createHelp("avatar", {
          "@[insertUsername]": "to get the avatar of the tagged user",
        })),
      at: () => get_avatar(),
    },
    draw: {
      icon: 0x270f,
      daily: postSketchDaily,
      help: runner =>
        runner.send(createHelp("draw", { daily: "to get current SketchDaily topic" })),
    },
    random: {
      icon: 0x2753,
      coin: r => (randomNumber(0, 1) === 0 ? r.send("Head") : r.send("Tails")),
      number: (r, min, max) => r.send(randomNumber(min || 0, max || 1)),
      anime: randomAnime,
      pokemon: randomPokemon,
      help: runner =>
        runner.send(createHelp("random", {
          coin: "to flip a coin",
          "number [min|0] [max|1]": "to get a random number between range",
          "anime (character?) [amount:1-5]": "for a random anime or character",
          "pokemon [amount:1-5]": "for random pokemons",
        })),
    },
    autocmd: {
      icon: 0x1f5d8,
      list: listCommands,
      add: addCommand,
      remove: removeCommand,
      help: runner =>
        runner.send(createHelp("autocmd", {
          list: "to list all active auto commands",
          'add [cron] [cmd]': "to add a auto command",
          'remove [id]': "to remove a auto command by id",
        })),
    },
  };

  const runner = new CommandRunner(message, prefix, commands);
  runner.runCommand(message.content.slice(prefix.length));

});

client.login(token);
