const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.use(cookieParser())
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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "nicoleTest": {
    id: "nicoleTest",
    email: "nic@test.com",
    password: "test"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, userID: users[req.cookies["userID"]] };
  res.render("urls_index", templateVars);
})

app.get('/urls/new', (req, res) => {
  if (users[req.cookies["userID"]] === undefined) {
    res.redirect('/login');
  }
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("urls_new", templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: users[req.cookies["userID"]] };
  res.render('urls_show', templateVars);
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  const userAry = Object.values(users);
  let userID = null;
  let password = null;
  userAry.forEach(user => {
    if (user.email === req.body.email) {
      userID = user.id;
      if (user.password === req.body.password) {
        password = user.password;
      }
      return;
    }
  });

  if (userID === null) {
    return res.status(403).send('Error: 403 - invalid user email');
  }

  if (password === null) {
    return res.status(400).send('Error: 403 - incorrect password');
  }

  res.cookie('userID', userID);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("registration", templateVars);
})

app.post('/register', (req, res) => {
  const userAry = Object.values(users);
  userAry.forEach(user => {
    if (user.email === req.body.email) {
      res.status(400).send('Error: 400 - user email already exists');
      return;
    }
  })
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Error: 400 - email and/or password blank');
    return;
  } else {
    let userID = generateRandomString();
    users[userID] = { id: userID, email: req.body.email, password: req.body.password };
    res.cookie('userID', userID);
    res.redirect('/urls');
    console.log(users[userID]);
  }
})

app.get('/login', (req, res) => {
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("login", templateVars);
})
