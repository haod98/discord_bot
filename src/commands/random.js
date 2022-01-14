const { MessageEmbed } = require("discord.js");
const { randomNumbers } = require("../utils");
const Anilist = require("../Anilist");
const anilist = new Anilist(true);

const randomAnime = async (message, type = 1, count = 1) => {
  if (type == "character") {
    const c = parseInt(count, 10);
    if (isNaN(c) || c < 1) return;

    const response = await anilist.randomCharacters(Math.min(c, 5));
    response.forEach((char) => sendCharacter(message, char));
  } else {
    const c = parseInt(type, 10);
    if (isNaN(c) || c < 1) return;

    const response = await anilist.randomAnime(Math.min(c, 5));
    response.forEach((m) => sendMedia(message, m));
  }
};

const sendMedia = (message, media) => {
  const embed = new MessageEmbed()
    .setTitle(
      `${media.title.english || media.title.romaji} | ${media.title.native}`
    )
    // .setFooter(`${media.format} - ${media.status}`)
    .setURL(media.siteUrl)
    .setThumbnail(media.coverImage.large);

  if (media.description) {
    embed.setDescription(media.description.slice(0, 200));
  }

  message.send(embed);
};

const sendCharacter = (message, char) => {
  const embed = new MessageEmbed()
    .setTitle(char.name.full)
    .setURL(char.siteUrl)
    .setThumbnail(char.image.large);

  if (char.description) {
    embed.setDescription(char.description.slice(0, 200));
  }

  message.send(embed);
};

const randomPokemon = async ({ message }, count = 1) => {
  if (count < 1) return;
  const ids = randomNumbers(1, 898, Math.min(count, 5));
  if (ids.length == 0) return;

  try {
    ids.forEach((id) =>
      message.send(`https://zukan.pokemon.co.jp/detail/${id}`)
    );
  } catch (e) {
    message.send("Failed to get random pokemons");
    console.log(e);
  }
};

module.exports = {
  randomAnime,
  randomPokemon,
};
