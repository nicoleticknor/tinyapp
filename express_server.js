const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

//adding the body-parser and cookie-parser libraries
app.use(cookieParser());
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//server port info
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//random string generator for new shortURLs
const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//static users "database"
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
};

//static urls "database"
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "nicoleTest" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "nicoleTest" },
  "OJv8Ic": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }
};

// historic routes from early examples
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlsForUser = (id) => {
  const urlDatabaseAry = Object.entries(urlDatabase);
  const filteredURLs = urlDatabaseAry.reduce((acc, url) => {
    if (url[1].userID === id) {
      acc.push(url);
    }
    return acc;
  }, []);

  return filteredURLs;
};

/* --------- URL-RELATED ROUTES ---------*/

app.get('/urls', (req, res) => {
  if (users[req.cookies["userID"]]) {
    const filteredURLs = urlsForUser(users[req.cookies["userID"]].id);
    let templateVars = { urls: filteredURLs, userID: users[req.cookies["userID"]] };
    res.render("urls_index", templateVars);
  } else {
    //login redirect
    res.redirect('login');
  }
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.cookies["userID"]].id };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  //login redirect
  if (users[req.cookies["userID"]] === undefined) {
    res.redirect('/login');
  }
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  //login redirect
  if (users[req.cookies["userID"]] === undefined) {
    res.redirect('/login');
  }
  const shortURL = Object.values(req.params);
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, userID: users[req.cookies["userID"]] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  //login redirect
  if (users[req.cookies["userID"]] === undefined) {
    res.redirect('/login');
    return;
  }
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: users[req.cookies["userID"]].id };
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  //login redirect
  if (users[req.cookies["userID"]] === undefined) {
    res.redirect('/login');
    return;
  }
  const shortString = Object.values(req.params).toString();
  const shortURL = shortString.split(',')[0];
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//a redirect route for visiting the desired URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

/* --------- LOG IN and REGISTER ROUTES ---------*/

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
});

app.post('/logout', (req, res) => {
  console.log(req.cookies);
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const userAry = Object.values(users);
  userAry.forEach(user => {
    if (user.email === req.body.email) {
      res.status(400).send('Error: 400 - user email already exists');
      return;
    }
  });
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
});

app.get('/login', (req, res) => {
  let templateVars = { userID: users[req.cookies["userID"]] };
  res.render("login", templateVars);
});
