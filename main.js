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


    const animal_fact = (command) => {
        fetch(`https://cat-fact.herokuapp.com/facts/random?animal_type=${command}&amount=1`).then(response => response.json()).then(data => {
            message.channel.send(data.text);
        });
    };

    const animal_img = (animal, token) => {
        fetch(`https://api.the${animal}api.com/v1/images/search?api_key=${token}`).then(response => response.json()).then(data => {
            message.channel.send(data[0].url);
            if (Object.keys(data[0].breeds).length !== 0) {
                message.channel.send(`This ${animal} breed is called: **${data[0].breeds[0].name}**`);
            };
        });
    };



    const commands = {
        cat: {
            _: empty_arg,
            fact: animal_fact,
            img: () => animal_img('cat', cat_token)
        },
        dog: {
            _: empty_arg,
            fact: animal_fact,
            img: () => animal_img('dog', dog_token),
        }
    };





    if ((Object.keys(commands)).indexOf(command) === -1) {
        message.channel.send(`This command doesn't exist`);
    } else if (args.length === 0) {
        const missing_arg = commands[command]['_'];
        missing_arg(command);
    } else {
        const call = commands[command][args[0]];
        call(command);
    };


    /*     if (args.length === 0) {
            missing_arg(command);
        } else {
            call(command);
        }
    
     */



    if (command === 'help') {


        /*         message.channel.send({
                    embed: {
                        color: 3447003,
                        description: "A very simple Embed!"
                    }
                }); */

        /*         message.channel.send(`Try one of the following commands: \n\
                    ${"`!me`"} Info about yourself \n\
                    ${"`!ghibli help`"} Info about Ghibli movies\n\
                    ${"`!avater @user`"} To get the users profile picture`);
                    */
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
/*         case 'cat':
            if (!args.length) {
                return empty_arg('cat');
            } else if (args[0] === 'fact') {
                return fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1').then(response => response.json()).then(data => {
                    message.channel.send(data.text);
                });
            } else if (args[0] === 'img') {
                return fetch(`https://api.thecatapi.com/v1/images/search?api_key=${cat_token}`).then(response => response.json()).then(data => {
                    message.channel.send(data[0].url);
                    if (Object.keys(data[0].breeds).length !== 0) {
                        message.channel.send(`This cat breed is called: **${data[0].breeds[0].name}**`);
                    };
                });
            } else if (args[0] === 'help') {
                return message.channel.send(`${"`!cat facts`"} for random cat facts\n${"`!cat img`"} for random cat images`);
            };
            message.channel.send(`No argument for **${args[0]}**. Try using ${"`!cat help`"}`);
            break;*/
/*         case 'dog':
            if (!args.length) {
                return message.channel.send(`Try using ${"`!dog help`"}`);
            } else if (args[0] === 'fact') {
                return fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=dog&amount=1').then(response => response.json()).then(data => {
                    message.channel.send(data.text);
                });
            } else if (args[0] === 'img') {
                return fetch(`https://api.thedogapi.com/v1/images/search?api_key=${dog_token}`).then(response => response.json()).then(data => {
                    message.channel.send(data[0].url);
                    if (Object.keys(data[0].breeds).length !== 0) {
                        message.channel.send(`This dog breed is called: **${data[0].breeds[0].name}**`);
                    };
                });
            } else if (args[0] === 'help') {
                return message.channel.send(`${"`!dog facts`"} for random cat facts\n${"`!dog img`"} for random dog images`)
            }

            message.channel.send(`No argument for **${args[0]}**. Try using ${"`!cat help`"}`);
            break;
 */        case 'ghibli':
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