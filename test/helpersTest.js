const chai = require('chai');
const assertDeep = chai.assert.deepEqual;
const expect = chai.expect;
const assert = chai.assert;
const { urlsForUser } = require('../helpers');
const { authenticateShortURL } = require('../helpers');
const { users } = require('../databases');
const { urlDatabase } = require('../databases');

describe('urlsForUser', () => {
  it('should return only those urls in the database which are owned by the user', () => {
    const expectedUrls = [
      ['b2xVn2', {
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'nicoleTest'
      }],
      ['9sm5xK', {
        longURL: 'http://www.google.com',
        userID: 'nicoleTest'
      }]
    ];
    const nicoleTestURLs = urlsForUser('nicoleTest')
    assertDeep(expectedUrls, nicoleTestURLs);
  });

  it('should return each url as an array with the second element as an object', () => {
    const result1 = urlsForUser('nicoleTest');
    const result2 = result1[0];
    expect(result2[1]).to.be.an('object');
  });


  it('the object returned should contain the longURL and the userID keys and their values', () => {
    const result1 = urlsForUser('nicoleTest');
    const result2 = result1[0];
    const result3 = result2[1];
    expectedResult = ['longURL', 'userID'];
    assertDeep(Object.keys(result3), expectedResult);
  });

  it('should not contain any objects with a different userID than the one passed in', () => {
    const userID = 'nicoleTest';
    const result = urlsForUser(userID);
    const ids = result.reduce((acc, ary) => {
      acc.push(ary[1].userID);
      return acc;
    }, []);

    ids.forEach(id => {
      assert.equal(id, userID);
    });
  });
});

describe('authenticateShortURL', () => {
  it('should return false if the URL is not in the database', () => {
    const url = 'b2xV52'
    const user = 'nicoleTest'
    const databaseEntry = urlDatabase[url]
    assert.notStrictEqual(authenticateShortURL(urlDatabase[url]) === false);
  });

  it('should return false if the userID passed in is not the same as the userID associated with the URL in the database', () => {

    const url = 'OJv8Ic'
    const user = 'nicoleTest'
    const databaseEntry = urlDatabase[url]
    assert.notStrictEqual(authenticateShortURL(urlDatabase[url]) === false);
  });


  it('should return true if the URL is in the database and the userID associated with the URL in the database matches the userID passed in', () => {

    const url = '9sm5xK'
    const user = 'nicoleTest'
    const databaseEntry = urlDatabase[url]
    assert.notStrictEqual(authenticateShortURL(urlDatabase[url]) === false);
  });
});
