const Discord = require('discord.js');

const { prefix, token, dog_token, cat_token } = require('./config.json');
const fetch = require('node-fetch');
const client = new Discord.Client();

function randomNumber(min, max){
    const r = Math.random()*(max-min) + min
    return Math.floor(r)
}

client.once('ready', () => console.log('Random bot is online'));

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const empty_arg = (command) => {
        message.channel.send(`Try using \`${prefix}${command} help\``);
    };

    const help = () => {
        const commands_array = Object.keys(commands).slice(1);

        const help_embed = new Discord.MessageEmbed()
            .setColor('ffa500')
            .setDescription('Random Bot is a bot with various commands')
            .setTitle(`Fear not! Random bot is here to save the day ${String.fromCodePoint(0x1F9B8)}`)
            .setThumbnail('https://cdn.discordapp.com/avatars/828890810622803999/444097a3d9688b2085c20a32b4e64403.png');


        //Adds dynamically help commands in the embed field
        const fields = [];
        for (let i = 0; i < commands_array.length; i++) {
            const help_command = commands_array[i];
            fields.push({
                name: `${String.fromCodePoint(commands[help_command].icon)} ${prefix}${commands_array[i]} help`,
                value: `For list of ${commands_array[i]} commands`,
            });
        };
        help_embed['fields'] = fields;
        message.channel.send(help_embed);
    };

    //API for animal facts
    const animal_fact = (command) => {
        fetch(`https://cat-fact.herokuapp.com/facts/random?animal_type=${command}&amount=1`).then(response => response.json()).then(data => {
            message.channel.send(data.text);
        });
    };

    //API for animal imgs
    const animal_img = (animal, token) => {
        fetch(`https://api.the${animal}api.com/v1/images/search?api_key=${token}`).then(response => response.json()).then(data => {
            message.channel.send(data[0].url);
            if (Object.keys(data[0].breeds).length !== 0) {
                message.channel.send(`This ${animal} breed is called: **${data[0].breeds[0].name}**`);
            };
        });
    };

    //If an animal command 'help' is called
    const animal_help = (animal) => {
        const animal_embed = new Discord.MessageEmbed()
            .setColor('4169E1')
            .setTitle(`${String.fromCodePoint(commands[animal].icon)} List of ${animal} commands`)
            .setDescription(`\`${prefix}${animal} img\` for a random ${animal} image
            \`${prefix}${animal} fact\` for a random ${animal} fact`)
        message.channel.send(animal_embed);
    };
    //If !me command is called
    const about_user = () => {
        message.channel.send(`${String.fromCodePoint(0x1F440)} Your Username is: **${message.author.username}** \n${String.fromCodePoint(0x1F194)} Your ID is: **${message.author.id}**`);
    };
    //Help for !me command
    const about_user__help = () => {
        message.channel.send(`Use \`${prefix}me\` for \n [_Your Username_] and [_Your unique ID from Discord_]`);
    };

    const get_avatar = () => {
        const tagged_user_id = message.mentions.users.toJSON()[0].id;
        const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
        const tagged_user = message.mentions.users.first();
        return message.channel.send(`Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`);
    };

    const get_avatar__help = () => {
        message.channel.send(`Use \`${prefix}avatar @[insertUsername]\` to get the avatar of the tagged user`);
    }

    const randomPokemon = () => {
        const id = randomNumber(1, 898);
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(r => r.json())
        .then(data => {
            // `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png`
            message.channel.send(`https://www.pokemon.com/us/pokedex/${data.name}`);
        })
        .catch(err => {
            message.channel.send('Failed to get random pokemon');
        });
    };

    const pokemon_help = () => {
        const embded = new Discord.MessageEmbed()
            .setColor('4169E1')
            .setTitle(`${String.fromCodePoint(commands.pokemon.icon)} List of pokemon commands`)
            .setDescription(`\`${prefix}pokemon random\` for a random pokemon`)
        message.channel.send(embded);
    };

    //List of commands with the args
    const commands = {
        help: {
            _: help
        },
        cat: {
            _: empty_arg,
            fact: animal_fact,
            img: () => animal_img('cat', cat_token),
            icon: 0x1F63A,
            help: () => animal_help('cat')
        },
        dog: {
            _: empty_arg,
            fact: animal_fact,
            img: () => animal_img('dog', dog_token),
            icon: 0x1F436,
            help: () => animal_help('dog')
        },
        me: {
            _: about_user,
            icon: 0x1F194,
            help: about_user__help
        },
        avatar: {
            _: empty_arg,
            icon: 0x1F5BC,
            help: get_avatar__help,
            at: () => get_avatar()
        },
        pokemon: {
            _: empty_arg,
            random: () => randomPokemon(),
            icon: 0x1F43F,
            help: pokemon_help,
        },
    };


    if ((Object.keys(commands)).indexOf(command) === -1) { //If command doesn't exist
        const msg = `"${prefix}help"`;
        return message.channel.send(`This command doesn't exist. Try using ${msg}`);
    } else if (args.length === 0) { //If the arg is empty
        const missing_arg = commands[command]['_'];
        return missing_arg(command);
    } else if (args[0].startsWith('<@')) {
        if ((Object.keys(commands[command])).indexOf('at') !== -1) {
            const fn = commands[command]['at'];
            return fn()
        }
        else {
            return message.channel.send(`This argument doesn't exist. Try using \`${prefix}${command} help\``);
        };
    } else if ((Object.keys(commands[command])).indexOf(args[0]) === -1) { //If the arg of a command doesn't exist
        return message.channel.send(`This argument doesn't exist. Try using \`${prefix}${command} help\``);
    } else { //Call command
        const call = commands[command][args[0]];
        return call(command);
    };
});

client.login(token);