const express = require("express");
const mainRouter = require('./routes/main');
const urlsRouter = require('./routes/urls');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-cookie-key', 'key2']
}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use('/', mainRouter);
app.use('/urls', urlsRouter);

//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
