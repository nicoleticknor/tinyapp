const { urlDatabase } = require('./databases');

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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

const authenticateShortURL = (user, url) => {
  if (!urlDatabase[url] || user !== urlDatabase[url].userID) {
    return false;
  }
  return true;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  authenticateShortURL,
};
