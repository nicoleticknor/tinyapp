const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

//
const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');

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
        return res.status(403).send('Error: 403 - invalid password');
      }
    }
  }
  return res.status(403).send('Error: 403 - invalid email');
});

router.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    //Built to spec; however, I don't believe this is optimal behaviour. The user may want to register for a new account, and in that case, they should be told to log out first, rather than redirecting them.
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
      return res.status(400).send('Error: 400 - user email already exists');
    }
  }

  if (req.body.email === '' || password === '') {
    return res.status(400).send('Error: 400 - email and/or password blank');
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
  res.redirect('/login');
});

//need to update to return HTML with a rel error msg
//what can I do to test whether the external website URL exists or not?
router.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const extWebsite = urlDatabase[shortURL].longURL;
  res.redirect(extWebsite);
});

module.exports = router;
