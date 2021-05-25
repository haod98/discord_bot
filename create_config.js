const fs = require("fs");
const args = process.argv.slice(2);
const configPath = "./config.json";

if (args.length >= 3) {
  const config = {
    prefix: "?",
    token: args[0],
    dog_token: args[1],
    cat_token: args[2],
  };

  if (fs.existsSync(configPath)) {
    console.log("Config file already exists.");
  } else {
    fs.writeFile("./config.json", JSON.stringify(config), () => {
      console.log("Successfully created the config file");
    });
  }
}
