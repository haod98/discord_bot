const { nextDay, nextSaturday, parseISO, parse } = require("date-fns");
const { Message, Client, GuildScheduledEventEntityType } = require("discord.js");
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

const scheduleWeeklyGesture = async (runner, voiceChannel, dayOfWeek = 1, time = null) => {
    let date = new Date();
    if (time != null) {
        date = parse(time, 'HH:mm', date);
    }
    runner.message.guild.scheduledEvents.create({
        name: 'Weekly Gesture',
        scheduledStartTime: nextDay(date, dayOfWeek),
        privacyLevel: 'GUILD_ONLY',
        entityType: 'VOICE',
        channel: voiceChannel,
    });
};

module.exports = {
    postSketchDaily,
    scheduleWeeklyGesture,
};