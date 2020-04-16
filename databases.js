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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "nicoleTest" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "nicoleTest" },
  "8f6S9h": { longURL: "http://www.github.com", userID: "nicoleTest2" },
  "OJv8Ic": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }
};

module.exports = { users, urlDatabase };
