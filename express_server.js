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

//adding a route for /urls, which will use res.render() and pass the URL data from urlDatabase to our template, because that's what we want to display on our /urls page
app.get('/urls', (req, res) => {
  //we are passing in a template object so that we have access to the properties within urlDatabase in our urls_index page
  let templateVars = { urls: urlDatabase };
  //now we can use those funny <%= %> symbols with urls: urlDatabase KVs
  //it's always passed in as an object, so we can use the key (urls) to access it within the template
  //<%= urls %> will render the whole urlDatabase, <%= urls.url %> will render a specific url in a loop context
  res.render("urls_index", templateVars);
})
