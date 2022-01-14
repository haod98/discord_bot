const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");

const getAnimeSearchResult = async (message, url) => {
    try {
        const fetchData = await fetch(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
        return await fetchData.json();
    } catch (e) {
        message.send("Something went wrong");
        console.log(e);
    };
};

const animeSearch = async (message, url) => {
    const result = await getAnimeSearchResult(message, url);
    console.log(result);
    const errorMsg = result.error;
    if (errorMsg) {
        message.send(`${errorMsg}`);
    } else {
        sendResult(message, result);
    }
}

const sendResult = (message, result) => {
    const anime = result.result[0];
    console.log(message);
    const message = new MessageEmbed()
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
    message.send(message);
}

module.exports = { animeSearch };