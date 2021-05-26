const express = require("express");
const app = express();
const port = process.env.PORT;

// Heroku needs a server to bind the port to, otherwise it fails with an error
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});