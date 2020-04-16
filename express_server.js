const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

//libraries
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-cookie-key', 'key2']
}));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//server/port 
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

//function to filter URLs by user
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

/* --------- GENERAL URL-RELATED ROUTES ---------*/

app.get("/", (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls')
  }
});

app.get('/urls', (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
  }
  if (req.session.userID) {
    const filteredURLs = urlsForUser(req.session.userID);
    let templateVars = { urls: filteredURLs, userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_index", templateVars);
  }
});

app.post('/urls', (req, res) => {
  let extWebsite = null;
  const urlParsed = req.body.longURL.split('http://');

  if (urlParsed.length === 1) {
    extWebsite = 'http://' + urlParsed[0];
  } else {
    extWebsite = req.body.longURL;
  }
  if (extWebsite === null) {
    res.status(400).send('Error: 400 - invalid URL');
    return;
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: extWebsite, userID: req.session.userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
  } else {
    let templateVars = { userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_new", templateVars);
  }

});

/* --------- LOG IN and REGISTER ROUTES ---------*/

app.get('/login', (req, res) => {
  let templateVars = { userID: req.session.userID };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const userAry = Object.values(users);
  let userID = null;
  let password = null;
  userAry.forEach(user => {
    if (user.email === req.body.email) {
      userID = user.id;
      /* -----  this condtion is for testing with nicoleTest user. remove for prod ----*/
      if (user.id === "nicoleTest") {
        return password = user.password;
      } else {
        const cryptCompare = (bcrypt.compareSync(req.body.password, user.password));
        if (cryptCompare) {
          return password = user.password;
        }
      }
    }
  });

  if (userID === null) {
    return res.status(403).send('Error: 403 - invalid user email');
  }

  if (password === null) {
    return res.status(400).send('Error: 403 - incorrect password');
  }

  req.session.userID = userID;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { userID: req.session.userID }; // is userID needed?
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {
  const password = req.body.password;
  const userAry = Object.values(users);
  userAry.forEach(user => {
    if (user.email === req.body.email) {
      res.status(400).send('Error: 400 - user email already exists');
      return;
    }
  });

  if (req.body.email === '' || password === '') {
    res.status(400).send('Error: 400 - email and/or password blank');
    return;
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    let userID = generateRandomString();
    users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
    req.session.userID = userID;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

/* --------- URL-SPECIFIC ROUTES ---------*/

app.get('/urls/:shortURL', (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
    return;
  }
  const shortURL = Object.values(req.params);
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, userID: req.session.userID, email: users[req.session.userID].email };
  res.render('urls_show', templateVars);
});

//using put with Method Override
app.put('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect('/urls');
});

//using delete with Method Override
app.delete('/urls/:shortURL', (req, res) => {
  if (req.session.userID === undefined) {
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
  const extWebsite = urlDatabase[shortURL].longURL;
  res.redirect(extWebsite);
});
