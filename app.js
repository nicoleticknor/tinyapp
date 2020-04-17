/* --------------Welcome to Tiny App--------------- 

Project Start Date: Monday, April 13, 2020
Project Publication Date: Thursday, April 16, 2020

To run the server, use npm start in the terminal.

Routing is done in /routes
Templates are found in /views
Helper functions are stored in helpers.js
Dummy/test data is stored in databases.js

---------------------------------------------------*/
const express = require("express");
const mainRouter = require('./routes/main');
const urlsRouter = require('./routes/urls');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-cookie-key', 'key2']
}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use('/', mainRouter);
app.use('/urls', urlsRouter);


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
