const fs = require('fs');
const Anilist = require('../src/Anilist');
const anilist = new Anilist();

const characterIdsQuery = `
query($page: Int) {
  Page (page: $page, perPage: 50) {
    pageInfo {
        currentPage
        lastPage
        hasNextPage
    }
    characters {
        id
    }
  }
}
`;

const animeIdsQuery = `
query($page: Int) {
  Page (page: $page, perPage: 50) {
    pageInfo {
        currentPage
        lastPage
        hasNextPage
    }
    media {
        id
    }
  }
}
`;

const timer = ms => new Promise( res => setTimeout(res, ms));

async function getAnimes(page, ids) {
    const body = await getPage(animeIdsQuery, page);
    const loadedIds = body.media.map(c => c.id);
    ids.push(...loadedIds);

    if (body.pageInfo.hasNextPage) {
        console.log(`Page ${body.pageInfo.currentPage}/${body.pageInfo.lastPage}`);
        await timer(250);
        await getAnimes(page + 1, ids);
    }
}

async function getCharacters(page, ids) {
    const body = await getPage(characterIdsQuery, page);
    const loadedIds = body.characters.map(c => c.id);
    ids.push(...loadedIds);

    if (body.pageInfo.hasNextPage) {
        console.log(`Page ${body.pageInfo.currentPage}/${body.pageInfo.lastPage}`);
        await timer(500);
        await getCharacters(page + 1, ids);
    }
}

async function getPage(query, page) {
    try {
        const response = await anilist.query(query, {page});
        if (response == null) {
            console.log('Empty response');
            return;
        }

        if (response.errors) {
            console.log('Errors', response.errors);
            return;
        }

        return response.data.Page;
    } catch(e) {
        console.log('Request failed', e);
    }
}

const ids = [];

// getCharacters(1, ids)
// .then(() => {
//     fs.writeFileSync('db/characters.json', JSON.stringify(ids), {encoding: 'utf8', flag: 'w'})
//     console.log(`Characters written to file: ${ids.length}`);
// })

getAnimes(1, ids)
.then(() => {
    fs.writeFileSync('db/anime.json', JSON.stringify(ids), {encoding: 'utf8', flag: 'w'})
    console.log(`Animes written to file: ${ids.length}`);
})
