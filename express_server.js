const express = require("express");
const app = express();
const PORT = 8080;

//must tell express to use EJS as its templating engine
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//root page where all it says is hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random endpoint that displays the database object in JSON
//res.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//random endpoint that displays hello world formatted
//res.send
app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})
