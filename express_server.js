const express = require("express");
const app = express();
const PORT = 8080;

//must tell express to use EJS as its templating engine
app.set('view engine', 'ejs');

//adding the body-parser library 
const bodyParser = require('body-parser');
//telling express() (our app) to use body-parser. This will parse any req.body objects received from POST requests from a Buffer into a string that we have access to. We will get req.body.longURL from this 
app.use(bodyParser.urlencoded({ extended: true }));

//random string generator
function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

//adding a GET route to display the new URL creation form when user navigates to /urls/new
//we have to put this BEFORE the /urls/:shortURL route, because otherwise it will think /new is just an instance of :shortURL!
app.get('/urls/new', (req, res) => {
  //telling it to render the code found in the urls_new file
  //not adding any dynamic variables because we don't need any
  res.render("urls_new");
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //so now we have access to the individual shortURL: longURL KV pair in the instance of the urls_show page this routes to when GET'd
  res.render('urls_show', templateVars);
})

//route for the post request to create a new url
//the urls_new form has a method that invokes POST with the action "/urls". So this route corresponds with POST on /urls
app.post('/urls', (req, res) => {
  console.log(req.body) //log the POST request body to the console, an object with the input name as the key and the user's input as the value. We receive it in this format because of the body-parser module
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); // temp dummy response
})
