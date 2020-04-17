const express = require("express");
const router = express.Router();
const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');
const { urlsForUser } = require('../helpers');
const { authenticateShortURL } = require('../helpers');

router.get('/', (req, res) => {
  if (!users[req.session.userID]) {
    res.status(401).send('Error: 401 - must be logged in to view your Short URLs');
  } else {
    const filteredURLs = urlsForUser(req.session.userID);
    let templateVars = { urls: filteredURLs, userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_index", templateVars);
  }
});

router.post('/', (req, res) => {
  if (!users[req.session.userID]) {
    res.status(401).send('Error: 401 - must be logged in to view your Short URLs');
  } else {
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
  }
});

router.get('/new', (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect('/login');
  } else {
    let templateVars = { userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_new", templateVars);
  }
});

//need to update to display HTML with a relevant error message
router.get('/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!users[req.session.userID]) {
    res.status(401).send(`Error: 401 - shortURL ${shortURL} is unauthorized`);
  } else {
    const urlAuth = authenticateShortURL(users[req.session.userID].id, shortURL);
    if (!urlAuth) {
      res.status(401).send(`Error: 401 - shortURL ${shortURL} is unauthorized`);
    } else {
      let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, userID: req.session.userID, email: users[req.session.userID].email };
      res.render('urls_show', templateVars);
    }
  }
});

//THIS IS INCOMPLETE. figure out how to attempt to PUT from cURL
router.put('/:shortURL', (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect('/login');
  } else {
    const shortURL = req.params.shortURL;
    const urlAuth = authenticateShortURL(users[req.session.userID].id, shortURL);
    if (!urlAuth) {
      res.status(401).send(`Error: 401 - shortURL ${shortURL} is unauthorized`);
    } else {
      urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
      res.redirect('/urls');
    }
  }
});

router.delete('/:shortURL', (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect('/login');
  } else {
    const shortURL = req.params.shortURL.split(',')[0];
    const urlAuth = authenticateShortURL(users[req.session.userID].id, shortURL);
    if (!urlAuth) {
      res.status(401).send(`Error: 401 - shortURL ${shortURL} is unauthorized`);
    } else {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    }
  }
});

module.exports = router;
