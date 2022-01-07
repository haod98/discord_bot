const Snoowrap = require("snoowrap");

const {
    reddit_clientId,
    reddit_clientSecret,
    reddit_password,
    reddit_username,
} = require('../../config.json');

const reddit = new Snoowrap({
    userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
    clientId: reddit_clientId,
    clientSecret: reddit_clientSecret,
    username: reddit_username,
    password: reddit_password,
});


const postSketchDaily = async (runner) => {
    const submissions = await reddit
        .getSubreddit("SketchDaily")
        .getNew({ limit: 1 });
    if (submissions.length > 0) {
        runner.send(submissions[0].url);
    }
};


module.exports = {
    postSketchDaily,
};