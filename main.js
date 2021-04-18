const Discord = require('discord.js');

const { prefix, token, dog_token, cat_token } = require('./config.json');
const fetch = require('node-fetch');
const client = new Discord.Client();



client.once('ready', () => console.log('Random bot is online'));

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const empty_arg = (command) => {
        message.channel.send(`Try using \`!${command} help\``);
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
                name: `${String.fromCodePoint(commands[help_command].icon)} !${commands_array[i]} help`,
                value: `For list of ${commands_array[i]} commands`
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

    //If animal command 'help' is called
    const animal_help = (animal) => {
        const animal_embed = new Discord.MessageEmbed()
            .setColor('4169E1')
            .setTitle(`${String.fromCodePoint(commands[animal].icon)} List of ${animal} commands`)
            .setDescription(`\`!${animal} img\` for a random ${animal} image
            \`!${animal} fact\` for a random ${animal} fact`)
        message.channel.send(animal_embed);
    }

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
        }
    };

    if ((Object.keys(commands)).indexOf(command) === -1) { //If command doesn't exist
        message.channel.send(`This command doesn't exist. Try using ${"`!help`"}`);
    } else if (args.length === 0) { //If the arg is empty
        const missing_arg = commands[command]['_'];
        missing_arg(command);
    } else if ((Object.keys(commands[command])).indexOf(args[0]) === -1) { //If the arg of a command doesn't exist
        message.channel.send(`This argument doesn't exist. Try using \`!${command} help\``);
    } else { //Call command
        const call = commands[command][args[0]];
        call(command);
    };


    switch (command) {
        case 'me':
            message.channel.send(`Your Username is: **${message.author.username}** \nYour ID is: **${message.author.id}**`);
            break;
        case 'avatar':
            if (!message.mentions.users.size) {
                return message.reply(`You need to tag someone`);
            } else {
                const tagged_user_id = message.mentions.users.toJSON()[0].id;
                const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
                const tagged_user = message.mentions.users.first();
                message.channel.send(`Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`);
            };
            break;
        case 'ghibli':
            if (!args.length) {
                return message.channel.send(`Try using ${"`!ghibli help`"}`)
            } else if (args[0] === 'castle') {
                return fetch('https://ghibliapi.herokuapp.com/films').then(response => response.json()).then(data => {
                    message.channel.send(data[0].title);
                });
            };
            message.channel.send(`No argument for **${args[0]}**. Try using ${"`!ghibli help`"}`);
            break;
    };
});


client.login(token);