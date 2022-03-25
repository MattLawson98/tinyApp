const userUrls = function(id, urlDatabase) {
  const personalUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      personalUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return personalUrls;
};

const usedEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false
};

const knownUser = function(cookie, users) {
  for (const user in users) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

function generateRandomString() {
  return Math.random().toString(25).slice(-6);
};

const emailId = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

module.exports = {
  userUrls,
  usedEmail,
  knownUser,
  generateRandomString,
  emailId,
}