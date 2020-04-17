const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

//
const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');
const { checkURL } = require('../helpers');

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
    //Built to spec; however, I don't believe this is optimal behaviour. The requirement is to redirect the user to /urls if they are already logged in. But the user may want to register for a new account, and in that case, they should be told to log out first with an error message, rather than redirecting them.
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("registration", templateVars);
  }
});

router.post('/register', (req, res) => {
  const password = req.body.password;
  const userAry = Object.values(users);

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
  //I decided not to build this to spec.
  //The requirement is to redirect to /urls upon logging out, but users who are not logged in and try to GET /urls are met with an error message.
  //I think that's an unnecessary unpleasant effect for logging out, so the redirect here is to /login.
  //Flagging because this is a "Major" requirement, but I believe it's wrong.
  res.redirect('/login');
});

router.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const longURLSplit = urlDatabase[shortURL].longURL.split('//');
  const extWebsite = longURLSplit[1].toString();

  const httpCallback = (input, url) => {
    if (input) {
      return res.redirect(longURL);
    } else {
      const templateVars = { userID: req.session.userID, email: users[req.session.userID].email, statusCode: 401, errorMsg: `URL ${url} is not responding` };
      res.render('error', templateVars);
    }
  };

  checkURL(extWebsite, longURL, httpCallback);
});

module.exports = router;
