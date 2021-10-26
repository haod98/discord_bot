const Discord = require("discord.js");
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
const { randomNumber, randomNumbers } = require("./src/utils");
const client = new Discord.Client();
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
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const empty_arg = (command) => {
    message.channel.send(`Try using \`${prefix}${command} help\``);
  };

  const help = () => {
    const commands_array = Object.keys(commands).slice(1);

    const help_embed = new Discord.MessageEmbed()
      .setColor("ffa500")
      .setDescription("Random Bot is a bot with various commands")
      .setTitle(
        `Fear not! Random bot is here to save the day ${String.fromCodePoint(
          0x1f9b8
        )}`
      )
      .setThumbnail(
        "https://cdn.discordapp.com/avatars/828890810622803999/444097a3d9688b2085c20a32b4e64403.png"
      );

    //Adds dynamically help commands in the embed field
    const fields = [];
    for (let i = 0; i < commands_array.length; i++) {
      const help_command = commands_array[i];
      fields.push({
        name: `${String.fromCodePoint(commands[help_command].icon)} ${prefix}${
          commands_array[i]
        } help`,
        value: `For list of ${commands_array[i]} commands`,
      });
    }
    help_embed["fields"] = fields;
    message.channel.send(help_embed);
  };

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
      `${String.fromCodePoint(0x1f440)} Your Username is: **${
        message.author.username
      }** \n${String.fromCodePoint(0x1f194)} Your ID is: **${
        message.author.id
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

  const randomPokemon = async (count = 1) => {
    if (count < 1) return;
    const ids = randomNumbers(1, 898, Math.min(count, 5));
    if (ids.length == 0) return;

    try {
      ids.forEach((id) =>
        message.channel.send(`https://zukan.pokemon.co.jp/detail/${id}`)
      );
    } catch (e) {
      message.channel.send("Failed to get random pokemons");
      console.log(e);
    }
  };

  const randomAnime = async (type = 1, count = 1) => {
    if (type == "character") {
      const c = parseInt(count, 10);
      if (isNaN(c) || c < 1) return;

      const response = await anilist.randomCharacters(Math.min(c, 5));
      response.forEach((char) => sendCharacter(char));
    } else {
      const c = parseInt(type, 10);
      if (isNaN(c) || c < 1) return;

      const response = await anilist.randomAnime(Math.min(c, 5));
      response.forEach((m) => sendMedia(m));
    }
  };

  const sendMedia = (media) => {
    const embed = new Discord.MessageEmbed()
      .setTitle(
        `${media.title.english || media.title.romaji} | ${media.title.native}`
      )
      .setFooter(`${media.format} - ${media.status}`)
      .setURL(media.siteUrl)
      .setThumbnail(media.coverImage.large);

    if (media.description) {
      embed.setDescription(media.description.slice(0, 200));
    }

    message.channel.send(embed);
  };

  const sendCharacter = (char) => {
    const embed = new Discord.MessageEmbed()
      .setTitle(char.name.full)
      .setURL(char.siteUrl)
      .setThumbnail(char.image.large);

    if (char.description) {
      embed.setDescription(char.description.slice(0, 200));
    }

    message.channel.send(embed);
  };

  const send = (obj) => message.channel.send(obj);

  const postSketchDaily = async () => {
    const submissions = await reddit
      .getSubreddit("SketchDaily")
      .getNew({ limit: 1 });
    if (submissions.length > 0) {
      send(submissions[0].url);
    }
  };

  const printHelp = (key, cmds) => {
    const embded = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands[key].icon)} List of ${key} commands`
      )
      .setDescription(
        Object.keys(cmds).map((cmd) => {
          return `\`${prefix}${key} ${cmd}\` ${cmds[cmd]}`;
        })
      );
    message.channel.send(embded);
  };

  //List of commands with the args
  const commands = {
    help: {
      _: help,
    },
    cat: {
      fact: animal_fact,
      img: () => animal_img("cat", cat_token),
      icon: 0x1f63a,
      help: () =>
        printHelp("dog", {
          img: "for a random cat image",
          fact: "for a random cat fact",
        }),
    },
    dog: {
      fact: animal_fact,
      img: () => animal_img("dog", dog_token),
      icon: 0x1f436,
      help: () =>
        printHelp("dog", {
          img: "for a random dog image",
          fact: "for a random dog fact",
        }),
    },
    me: {
      _: about_user,
      icon: 0x1f194,
      help: () =>
        printHelp("me", {
          "": "for \n [_Your Username_] and [_Your unique ID from Discord_]",
        }),
    },
    avatar: {
      icon: 0x1f5bc,
      help: () =>
        printHelp("avatar", {
          "@[insertUsername]": "to get the avatar of the tagged user",
        }),
      at: () => get_avatar(),
    },
    draw: {
      icon: 0x270f,
      daily: () => postSketchDaily(),
      help: () =>
        printHelp("draw", { daily: "to get current SketchDaily topic" }),
    },
    random: {
      icon: 0x2753,
      coin: () => (randomNumber(0, 1) === 0 ? send("Head") : send("Tails")),
      number: (_, min, max) => send(randomNumber(min || 0, max || 1)),
      anime: (_, type, count) => randomAnime(type, count),
      pokemon: (_, arg) => randomPokemon(arg),
      help: () =>
        printHelp("random", {
          coin: "to flip a coin",
          "number [min|0] [max|1]": "to get a random number between range",
          "anime (character?) [amount:1-5]": "for a random anime or character",
          "pokemon [amount:1-5]": "for random pokemons",
        }),
    },
  };

  if (Object.keys(commands).indexOf(command) === -1) {
    //If command doesn't exist
    const msg = `"${prefix}help"`;
    return message.channel.send(`This command doesn't exist. Try using ${msg}`);
  } else if (args.length === 0) {
    //If the arg is empty
    const missing_arg = commands[command]["_"];
    if (missing_arg) {
      return missing_arg(command);
    } else {
      return empty_arg(command);
    }
  } else if (args[0].startsWith("<@")) {
    if (Object.keys(commands[command]).indexOf("at") !== -1) {
      const fn = commands[command]["at"];
      return fn();
    } else {
      return message.channel.send(
        `This argument doesn't exist. Try using \`${prefix}${command} help\``
      );
    }
  } else if (Object.keys(commands[command]).indexOf(args[0]) === -1) {
    //If the arg of a command doesn't exist
    return message.channel.send(
      `This argument doesn't exist. Try using \`${prefix}${command} help\``
    );
  } else {
    //Call command
    const call = commands[command][args[0]];
    return call(command, ...args.slice(1));
  }
});

client.login(token);
