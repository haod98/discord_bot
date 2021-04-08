const Discord = require('discord.js');

const { prefix, token } = require('./config.json');
const fetch = require('node-fetch');
const client = new Discord.Client();


client.once('ready', () => console.log('Random bot is online'));

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
        message.channel.send(`Try one of the following commands: \n\
${"`!me`"} Info about yourself \n\
${"`!ghibli help`"} Info about Ghibli movies\n\
${"`!avater @user`"} To get the users profile picture`);
    };

    if (command === 'me') {
        message.channel.send(`Your Username is: ${message.author.username} \nYour ID is: ${message.author.id}`);
    };

    if (command === 'test') {
        const first_msg = message.content;
        message.channel.send(`The first message ${first_msg}`);
    };

    if (command === 'avatar') {
        if (!message.mentions.users.size) {
            console.log(message.mentions.users.size, !message.mentions.users.size);
            return message.reply(`You need to tag someone`);
        } else {
            const tagged_user_id = message.mentions.users.toJSON()[0].id;
            const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
            const tagged_user = message.mentions.users.first();
            console.log(!message.mentions.users.size);
            message.channel.send(`Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`);
        };
    };



    if (command === 'ghibli') {
        if (!args.length) {
            return message.channel.send(`Try using ${"`!ghibli help`"}`)
        } else if (args[0] === 'castle') {
            fetch('https://ghibliapi.herokuapp.com/films').then(response => response.json()).then(data => {
                message.channel.send(data[0].title);
            });
        };

        message.channel.send(`No argument for **${args[0]}**. Try using ${"`!ghibli help`"}`);


    };

});


client.login(token);