const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");

const getAnimeSearchResult = async (runner, url) => {
    try {
        const fetchData = await fetch(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
        return await fetchData.json();
    } catch (e) {
        runner.send("Something went wrong");
        console.log(e);
    };
};

const animeSearch = async (runner, url) => {
    const result = await getAnimeSearchResult(runner, url);
    const errorMsg = result.error;
    if (errorMsg) {
        runner.send(`${errorMsg}`);
    } else {
        sendResult(runner, result);
    }
}

const sendResult = (runner, result) => {
    const anime = result.result[0];
    const message = new MessageEmbed()
        .setColor("AQUA")
        .setURL(`https://anilist.co/anime/${anime.anilist}/`)
        .setTitle('Anime')
        .setDescription('test')
    runner.send(message);
}

module.exports = { animeSearch };