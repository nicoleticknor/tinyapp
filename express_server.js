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
  "nicoleTest2": {
    id: "nicoleTest2",
    email: "nic@test2.com",
    password: "test"
  },
  "userRandomID": {
    id: "userRandomID",
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
  "8f6S9h": { longURL: "http://www.github.com", userID: "nicoleTest2" },
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

//display HTML with a relevant error message 
app.get('/urls', (req, res) => {
  if (users[req.session.userID] === undefined) {
    return res.status(401).send('Error: 401 - must be logged in to view your Short URLs');
  }

  if (req.session.userID) {
    const filteredURLs = urlsForUser(req.session.userID);
    let templateVars = { urls: filteredURLs, userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_index", templateVars);
  }
});

app.post('/urls', (req, res) => {
  //process to add http:// to a URL if the user did not include this in the from
  //is this the sort of thing that should be modularized into a function? I'm not using it more than once, but in theory I could
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
    return res.status(401).send('Error: 401 - must be logged in to create a new Short URL');
  } else {
    let templateVars = { userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_new", templateVars);
  }
});

/* --------- LOG IN and REGISTER ROUTES ---------*/

app.get('/login', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("login", templateVars);
  }
});

app.post('/login', (req, res) => {
  const userAry = Object.values(users);
  let userID = null;
  let isPasswordCorrect = false;

  userAry.forEach(user => {
    if (user.email === req.body.email) {
      //if the request contains a valid user email, set userID
      userID = user.id;
      /* -----  this condtion is for testing with nicoleTest and nicoleTest2 users. 
      remove for prod ----*/
      if (user.id === "nicoleTest" || user.id === "nicoleTest2") {
        return isPasswordCorrect = true;
        /* ---- end testing condition*/
      } else {
        //compare the password in the request with the password in the database
        const cryptCompare = (bcrypt.compareSync(req.body.password, user.password));
        if (cryptCompare) {
          //if they match, update the isPasswordCorrect variable to true
          return isPasswordCorrect = true;
        }
      }
    }
  });

  if (userID === null || isPasswordCorrect !== true) {
    return res.status(403).send('Error: 403 - invalid user email or password');
  }

  req.session.userID = userID;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    //NB that I don't believe this is optimal behaviour; the user may want to register for a new account, and instead should be told that they must log out to register. 
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("registration", templateVars);
  }
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

//need to update to display HTML with a relevant error message
app.get('/urls/:shortURL', (req, res) => {

  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
    return;
  }

  const shortURL = Object.values(req.params);

  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`Error: 404 - ${shortURL} not found`);
  }

  if (users[req.session.userID].id !== urlDatabase[shortURL].userID) {
    return res.status(401).send('Error: 401 - unauthorized URL');
  }

  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, userID: req.session.userID, email: users[req.session.userID].email };
  res.render('urls_show', templateVars);
});

//THIS IS INCOMPLETE. figure out how to attempt to PUT from cURL
app.put('/urls/:shortURL', (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
    return;
  }

  const shortURL = Object.values(req.params);

  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`Error: 404 - ${shortURL} not found`);
  }

  if (users[req.session.userID].id !== urlDatabase[shortURL].userID) {
    return res.status(401).send('Error: 401 - unauthorized URL');
  }

  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect('/urls');
});

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

//need to update to return HTML with a rel error msg
//what can I do to test whether the external website URL exists or not? 
app.get('/u/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const extWebsite = urlDatabase[shortURL].longURL;
  res.redirect(extWebsite);



});
