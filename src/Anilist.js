const fetch = require("node-fetch");

const characterQuery = `
query ($ids: [Int], $total: Int) {
  Page (page: 0, perPage: $total) {
    characters (id_in: $ids) {
        name {
            full
        }
        image {
            large
        }
        description
        siteUrl
    }
  }
}
`;

const animeQuery = `
query ($ids: [Int], $total: Int) {
  Page (page: 0, perPage: $total) {
    media (id_in: $ids) {
        title {
            english
            romaji
            native
        }
        status
        description
        format
        siteUrl
        coverImage {
            large
        }
    }
  }
}
`;
//Search for a specific anime ID
const singleAnimeQuery = `
query ($id: Int) {
    Media (id: $id) {
        title {
            english
            romaji
            native
        }
        status
        description
        format
        siteUrl
        coverImage {
            large
        }
  }
}
`;


function randomNumber(min, max) {
  const r = Math.random() * (max - min) + min;
  return Math.floor(r);
}

function randomNumbers(min, max, count = 1) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(randomNumber(min, max));
  }

  return ids;
}

const fs = require("fs");

class Anilist {
  constructor(load = false) {
    if (load) {
      const data = fs.readFileSync("db/characters.json", "utf8");
      this.characterIds = JSON.parse(data);

      const animes = fs.readFileSync("db/anime.json", "utf8");
      this.animeIds = JSON.parse(animes);
    }
  }

  async randomAnime(count) {
    const ids = randomNumbers(1, this.animeIds.length, count).map(
      (i) => this.animeIds[i]
    );
    return this.query(animeQuery, { ids, total: ids.length }).then(r => r.data.Page.media);
  }

  async randomCharacters(count) {
    const ids = randomNumbers(1, this.characterIds.length, count).map(
      (i) => this.characterIds[i]
    );
    return this.query(characterQuery, { ids, total: ids.length }).then(r => r.data.Page.characters);
  }

  async getAnime(id) {
    return this.query(singleAnimeQuery, { id: id }).then(r => console.log(r.data.Media));
  }

  async query(query, variables) {
    // Define the config we'll need for our Api request
    var url = "https://graphql.anilist.co",
      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      };

    // Make the HTTP Api request
    return fetch(url, options)
      .then(this._handleResponse)
      .catch(this._handleError);
  }

  _handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  _handleError(error) {
    console.error(error);
  }
}

module.exports = Anilist;
