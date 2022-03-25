const express = require("express");
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const users = {};
const urlDatabase = {};

const {userUrls, usedEmail, knownUser, generateRandomString, emailId,} = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['Matt','LHL','Tuna'],
  maxAge: 24 * 60 * 60 * 1000,
}));





// Checks if this is a logged in user and sends them to the main url page if not redirects them to the login!
app.get("/", (req, res) => {
  if (knownUser(req.session.user_id, users)) {
    res.redirect('/url')
  } else {
    res.status(401).send('Please login before accessing URL libraries')
  }
});


// Renders the url index with a list of urls specific to the acount that is logged in!
app.get("/urls", (req, res) => {
  if (knownUser(req.session.user_id, users)) {
  let templateVars = {
    urls: userUrls(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Please login before accessing URL libraries')
    
  }
});

//If logged in allows the user to navigate to the new url page , if not redirects the user back to the login!
app.get("/urls/new", (req, res) => {
  if (!knownUser(req.session.user_id, users)) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    } 
    res.render("urls_new", templateVars);
  } 
});


//This checks if you are logged in and if so will show the corisponding shortURL to a longURL
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserId: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("This short URL does not have a matching long URL")
  }
});
//This checks if you are signed in and if so will load the selected short url destination.
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (urlDatabase[req.params.shortURL] === undefined) {
      res.status(404);
    } else {
      res.redirect(urlDatabase[req.params.shortURL].longURL);
    }
  } else {
    res.status(400).send("This short URL does not have a matching long URL")
  }
});
//This page checks if you are logged in and if not allows for registration of an account
app.get("/register", (req,res) => {
  if (knownUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});
//This page checks if you are logged in and if not allows for a user to log in
app.get("/login", (req, res) => {
  if (knownUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  }
});
//This code allows users to create short urls when logged in
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  }
});
//This code helps users register accounts
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.status(400).send("Please include a valid email or password");
  } else if (usedEmail(userEmail, users)) {
    res.status(400).send("This email has already been used!");
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword)
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");
});
//This is the code for deleting URLS, it only allows users to delete their own URLS!
app.post("/urls/:shortURL/delete", (req, res) => {
const id = req.session.user_id;
const personalUrls = userUrls(id, urlDatabase);
if (Object.keys(personalUrls).includes(req.params.shortURL)) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
} else {
  res.status(401).send("You cannot delete this short URL!")
}
});
//This code helps users log in and makes sure the credentials are right
app.post("/login", (req, res) => {
  let userEmail =  req.body.email;
  let userPassword = req.body.password;
    if (!usedEmail(userEmail, users)) {
      res.status(400).send("There is no account with this email!")
    } else {
      const id = emailId(userEmail, users);
      if (!bcrypt.compareSync(userPassword , users[id].password )) {
        res.status(400).send("The password entered does not match the email provided!")
      } else {
        req.session.user_id = id;
        res.redirect('/urls');
      }
    }
});
//This code makes the session null, which logs a user out!
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => { 
  const id = req.session.user_id;
  const personalUrls = userUrls(id, urlDatabase);
  if (Object.keys(personalUrls).includes(req.params.id)) {
    urlDatabase[req.params.id].longURL = req.body.newUrl
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not allowed to edit this short URL!")
  }
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
