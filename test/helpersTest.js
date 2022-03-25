const { assert } = require('chai');

const { emailId } = require('../helpers.js');

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

describe('emailID', function() {
  it('should return a user with valid email', function() {
    const user = emailId("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined when no user exists for a given email address', function() {
    const user =emailId("Matt@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});