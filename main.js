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

// TODO: share
function randomNumber(min, max) {
  const r = Math.random() * (max - min) + min;
  return Math.floor(r);
}

function randomNumbers(min, max, count = 1) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(randomNumber(min, max));
  }

  return ids;
}

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

  //If an animal command 'help' is called
  const animal_help = (animal) => {
    const animal_embed = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(
          commands[animal].icon
        )} List of ${animal} commands`
      ).setDescription(`\`${prefix}${animal} img\` for a random ${animal} image
            \`${prefix}${animal} fact\` for a random ${animal} fact`);
    message.channel.send(animal_embed);
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
  //Help for !me command
  const about_user__help = () => {
    message.channel.send(
      `Use \`${prefix}me\` for \n [_Your Username_] and [_Your unique ID from Discord_]`
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

  const get_avatar__help = () => {
    message.channel.send(
      `Use \`${prefix}avatar @[insertUsername]\` to get the avatar of the tagged user`
    );
  };

  const randomPokemon = async (count = 1) => {
    if (count < 1) return;
    const ids = randomNumbers(1, 898, Math.min(count, 5));
    if (ids.length == 0) return;

    try {
      const responses = await Promise.all(
        ids.map((id) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
        )
      );
      ids.forEach((id) =>
        message.channel.send(`https://zukan.pokemon.co.jp/detail/${id}`)
      );
    } catch (e) {
      message.channel.send("Failed to get random pokemons");
      console.log(e);
    }
  };

  const pokemon_help = () => {
    const embded = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(
          commands.pokemon.icon
        )} List of pokemon commands`
      )
      .setDescription(
        `\`${prefix}pokemon random [amount:1-5]\` for a random pokemon`
      );
    message.channel.send(embded);
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
    console.log(media);
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

  const anime_help = () => {
    const embded = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands.anime.icon)} List of anime commands`
      )
      .setDescription(
        `\`${prefix}anime random (character?) [amount:1-5]\` for a random anime or character`
      );
    message.channel.send(embded);
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

  const draw_help = () => {
    const embded = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands.draw.icon)} List of draw commands`
      )
      .setDescription(
        `\`${prefix}draw daily\` to get current SketchDaily topic`
      );
    message.channel.send(embded);
  };

  const random_help = () => {
    const embded = new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands.draw.icon)} List of random commands`
      )
      .setDescription(
        `\`${prefix}random coin\` to flip a coin`,
        `\`${prefix}random number [min|0] [max|1]\` to get a random number between range`,
      );
    message.channel.send(embded);
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
  * Returns a random integer between min (inclusive) and max (inclusive).
  * The value is no lower than min (or the next integer greater than min
  * if min isn't an integer) and no greater than max (or the next integer
  * lower than max if max isn't an integer).
  * Using Math.round() will give you a non-uniform distribution!
  */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //List of commands with the args
  const commands = {
    help: {
      _: help,
    },
    cat: {
      _: empty_arg,
      fact: animal_fact,
      img: () => animal_img("cat", cat_token),
      icon: 0x1f63a,
      help: () => animal_help("cat"),
    },
    dog: {
      _: empty_arg,
      fact: animal_fact,
      img: () => animal_img("dog", dog_token),
      icon: 0x1f436,
      help: () => animal_help("dog"),
    },
    me: {
      _: about_user,
      icon: 0x1f194,
      help: about_user__help,
    },
    avatar: {
      _: empty_arg,
      icon: 0x1f5bc,
      help: get_avatar__help,
      at: () => get_avatar(),
    },
    pokemon: {
      _: empty_arg,
      random: (_, arg) => randomPokemon(arg),
      icon: 0x1f43f,
      help: pokemon_help,
    },
    anime: {
      _: empty_arg,
      random: (_, type, count) => randomAnime(type, count),
      icon: 0x1f1ef,
      help: anime_help,
    },
    draw: {
      _: empty_arg,
      icon: 0x270f,
      daily: () => postSketchDaily(),
      help: draw_help,
    },
    random: {
      _: empty_arg,
      icon: 0x003F,
      coin: () =>  getRandomInt(0, 1) === 0 ? send("Head") : send("Tails"),
      number: (_, min, max) => send(getRandomInt(min || 0, max || 1)),
      help: random_help,
    },
  };

  if (Object.keys(commands).indexOf(command) === -1) {
    //If command doesn't exist
    const msg = `"${prefix}help"`;
    return message.channel.send(`This command doesn't exist. Try using ${msg}`);
  } else if (args.length === 0) {
    //If the arg is empty
    const missing_arg = commands[command]["_"];
    return missing_arg(command);
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
