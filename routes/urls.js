const express = require("express");
const router = express.Router();

const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');
const { urlsForUser } = require('../helpers');

/* --------- GENERAL URL-RELATED ROUTES ---------*/


//display HTML with a relevant error message

// Example comment:
/**
 * Description
 * @params {*} link - Describe parameter
 */
router.get('/', (req, res) => {
  if (users[req.session.userID] === undefined) {
    return res.status(401).send('Error: 401 - must be logged in to view your Short URLs');
  }

  if (req.session.userID) {
    const filteredURLs = urlsForUser(req.session.userID);
    let templateVars = { urls: filteredURLs, userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_index", templateVars);
  }
});

router.post('/', (req, res) => {
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

router.get('/new', (req, res) => {
  if (users[req.session.userID] === undefined) {
    return res.status(401).send('Error: 401 - must be logged in to create a new Short URL');
  } else {
    let templateVars = { userID: req.session.userID, email: users[req.session.userID].email };
    res.render("urls_new", templateVars);
  }
});

/* --------- URL-SPECIFIC ROUTES ---------*/

//need to update to display HTML with a relevant error message
router.get('/:shortURL', (req, res) => {

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
router.put('/:shortURL', (req, res) => {
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

router.delete('/:shortURL', (req, res) => {
  if (req.session.userID === undefined) {
    res.redirect('/login');
    return;
  }
  const shortString = Object.values(req.params).toString();
  const shortURL = shortString.split(',')[0];
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});




module.exports = router;
