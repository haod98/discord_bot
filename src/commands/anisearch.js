const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const Anilist = require("../Anilist");
const anilist = new Anilist();

const searchAnimeImg = async (runner, url) => {
    const result = await getSearchResult(runner, url);
    const errorMsg = result.error;
    if (errorMsg) {
        runner.send(`${errorMsg}`);
    } else {
        createEmbedMessage(runner, result);
    };
};

const getSearchResult = async (runner, url) => {
    try {
        const fetchData = await fetch(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
        const result = await fetchData.json();
        return result;
    } catch (e) {
        runner.send("Something went wrong");
        console.log(e);
    };
};

const createEmbedMessage = async (runner, result) => {
    const anime = result.result[0];
    const animeId = anime.anilist;
    const aniListResult = await anilist.getAnime(animeId);
    const aniListDesc = aniListResult.description.slice(0, 250) + "...";
    const messageEmbed = new MessageEmbed()
        .setColor("AQUA")
        .setURL(`https://anilist.co/anime/${anime.anilist}/`)
        .setTitle(`[ENG] ${aniListResult.title.english} || [JP] ${aniListResult.title.romaji}`)
        .setAuthor({ name: `Random Bot` })
        .setFields(
            { name: "Anime name:", value: `[${aniListResult.title.english}](https://anilist.co/anime/${anime.anilist}/)`, inline: true },
            { name: "From episode:", value: `${anime.episode}`, inline: true },
            { name: "Total episodes:", value: `${aniListResult.episodes}`, inline: true },
            { name: "Status:", value: `${aniListResult.status}`, inline: true },
            { name: "Score:", value: `${aniListResult.averageScore}`, inline: true },
            { name: "Similarity to the searched image:", value: `${(anime.similarity * 100).toFixed(2)} %`, inline: true },
            { name: "Image result:", value: `[Image](${anime.image})`, inline: true },
            { name: "Video result (Sound):", value: `[Video](${anime.video})`, inline: true },
        )
        .setDescription(`${aniListDesc}`)
        .setImage(`${aniListResult.coverImage.large}`)
    runner.send(messageEmbed);
}

module.exports = { searchAnimeImg };