const express = require("express");
const router = express.Router();

//
const { urlDatabase } = require('../databases');
const { users } = require('../databases');
const { generateRandomString } = require('../helpers');
const { urlsForUser } = require('../helpers');

router.get("/", (req, res) => {
  if (users[req.session.userID] === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls')
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

router.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    //NB that I don't believe this is optimal behaviour; the user may want to register for a new account, and instead should be told that they must log out to register. 
    res.redirect('/urls');
  } else {
    let templateVars = { userID: req.session.userID };
    res.render("registration", templateVars);
  }
});

router.post('/register', (req, res) => {
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
