const fs = require("fs");
const args = process.argv.slice(2);
const configPath = "./config.json";

if (args.length >= 3) {
  const config = {
    prefix: "?",
    token: args[0],
    dog_token: args[1],
    cat_token: args[2],
    reddit_clientId: args[3],
    reddit_clientSecret: args[4],
    reddit_username: args[5],
    reddit_password: args[6],
  };

  if (fs.existsSync(configPath)) {
    console.log("Config file already exists.");
  } else {
    fs.writeFile("./config.json", JSON.stringify(config), () => {
      console.log("Successfully created the config file");
    });
  }
}
