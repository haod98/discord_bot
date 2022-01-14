const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");

const searchAnimeImg = async (message, url) => {
    const result = await getSearchResult(message, url);
    console.log(result);
    const errorMsg = result.error;
    if (errorMsg) {
        message.send(`${errorMsg}`);
    } else {
        createEmbedMessage(message, result);
    };
};

const getSearchResult = async (message, url) => {
    try {
        const fetchData = await fetch(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
        const result = await fetchData.json();
        return result;
    } catch (e) {
        message.send("Something went wrong");
        console.log(e);
    };
};

const createEmbedMessage = (message, result) => {
    const anime = result.result[0];
    console.log(message);
    const messageEmbed = new MessageEmbed()
        .setColor("AQUA")
        .setDescription('Hello these are my results for the image you were looking for')
        .setURL(`https://anilist.co/anime/${anime.anilist}/`)
        .setTitle('Anime')
        .setFields(
            { name: "Similarity with the image:", value: `${(anime.similarity * 100).toFixed(2)} %` },
            { name: "From episode:", value: `${anime.episode}`, inline: true },
            { name: "Image result:", value: `[Image](${anime.image})`, inline: true },
            { name: "Video result:", value: `[Video](${anime.video})`, inline: true },
            { name: "Link to anime:", value: `[Anime](https://anilist.co/anime/${anime.anilist}/)`, inline: true },
        )
    message.send(messageEmbed);
}

module.exports = { searchAnimeImg };