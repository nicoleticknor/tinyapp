const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');
const { checkURL } = require('../helpers');

/*-------------User-Related Routes ------------*/

router.get("/", (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

router.get('/login', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("login", templateVars);
  }
});

router.post('/login', (req, res) => {
  const userAry = Object.values(users);
  // process to validate user email and password, which is hashed with bcrypt
  for (const user of userAry) {
    if (user.email === req.body.email) {
      const cryptCompare = (bcrypt.compareSync(req.body.password, user.password));
      //note: nicoleTest and nicoleTest2 are static test accounts for which passwords are not hashed
      if (cryptCompare === true || user.id === "nicoleTest" || user.id === "nicoleTest2") {
        req.session.userID = user.id;
        return res.redirect('/urls');
      } else {
        const templateVars = { userID: req.session.userID, statusCode: 403, errorMsg: 'Incorrect Password' };
        res.render('error', templateVars);
      }
    }
  }
  const templateVars = { userID: req.session.userID, statusCode: 403, errorMsg: 'Invalid Email Address' };
  res.render('error', templateVars);
});

router.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("registration", templateVars);
  }
});

router.post('/register', (req, res) => {
  const password = req.body.password;
  const userAry = Object.values(users);

  //guard clauses to prevent duplicate users and blank passwords or email addresses
  for (const user of userAry) {
    if (user.email === req.body.email) {
      const templateVars = { userID: req.session.userID, statusCode: 400, errorMsg: 'An account with that email address already exists' };
      res.render('error', templateVars);
    }
  }
  if (req.body.email === '' || password === '') {
    const templateVars = { userID: req.session.userID, statusCode: 400, errorMsg: 'Email and/or password is blank' };
    res.render('error', templateVars);
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    let userID = generateRandomString();
    users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
    req.session.userID = userID;
    res.redirect('/urls');
  }
});

router.post('/logout', (req, res) => {
  req.session = null;
  /*Build differs from spec for the following reason:
  Spec states to redirect to /urls upon logging out; however, users who are not logged in and try to GET /urls are met with an error message.
  To avoid unnecessary unpleasantness after logging out, the build redirects to /login. */
  res.redirect('/login');
});

/*----------Off-Site Redirect Route------------*/
router.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const longURLSplit = urlDatabase[shortURL].longURL.split('//');
  const extWebsite = longURLSplit[1].toString();

  //callback used with the helper function invoked below
  const httpCallback = (input, url) => {
    if (input) {
      return res.redirect(longURL);
    } else {
      const templateVars = { userID: req.session.userID, email: users[req.session.userID].email, statusCode: 401, errorMsg: `URL ${url} is not responding` };
      res.render('error', templateVars);
    }
  };

  //invoking an http.request function to validate the external website before redirecting users to it.
  //callback renders an error to avoid timing out if a website is unresponsive.
  checkURL(extWebsite, longURL, httpCallback);
});

module.exports = router;
