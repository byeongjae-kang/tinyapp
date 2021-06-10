const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  
  it('should return a user with valid id', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });

  it('should return undefined for user.email', () => {
    const user = getUserByEmail("byeongjae@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user.email, expectedOutput);
  });

});