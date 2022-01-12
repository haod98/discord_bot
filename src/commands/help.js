const { MessageEmbed } = require("discord.js");

const help = (runner) => {
    const commands_array = Object.keys(runner.commands).slice(1);

    const help_embed = new MessageEmbed()
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
            name: `${String.fromCodePoint(runner.commands[help_command].icon)} ${runner.prefix}${commands_array[i]
                } help`,
            value: `For list of ${commands_array[i]} commands`,
        });
    }
    help_embed["fields"] = fields;
    runner.send(help_embed);
}

module.exports = {
    help
}