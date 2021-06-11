
const express = require("express");
const app = express();
const PORT = 8607;
const { getUserByEmail } = require('./helpers');
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));



// objects ----------------------------------------------------------------------
// when user add longURL random shortURL and longURL stored in here
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};
// when user registered info stored in here
const users = {
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



// functions --------------------------------------------------------------------
// create random 6digit id
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const urlsForUser = (id) => {
  const filteredObject = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    const userId = urlDatabase[key].userId;
    if (userId === id) {
      filteredObject[key] = urlDatabase[key];
    }
  }
  return filteredObject;
};



// routes urls---------------------------------------------------------------------
// render index template
app.get("/urls", (request, response) => {
  const userId = request.session['user_id'];
  const user = users[userId];
  const urls = urlsForUser(userId);
  const templateVars = { urls, user };
  response.render("urls_index", templateVars);
});
// render new template
app.get("/urls/new", (request, response) => {
  const userId = request.session['user_id'];
  const user =  users[userId];
  if (!user) {
    return response.redirect("/login");
  }

  const templateVars = { user };
  response.render("urls_new", templateVars);
});
//creat new short URL
app.post("/urls", (request, response) => {
  const randomString = generateRandomString();
  const longURL = request.body.longURL;
  const userId = request.session["user_id"];
  urlDatabase[randomString] = { longURL, userId };
  response.redirect(`/urls/${randomString}`);
});
// render url_show templates
app.get("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[request.session["user_id"]];
  const templateVars = { shortURL, longURL, user };
  response.render("urls_show", templateVars);
});
// redirect to actual website using shortURL
app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  response.redirect(longURL);
});
// edit longURL
app.post("/urls/:shortURL", (request, response) => {
  const userId = request.session["user_id"];
  const shortURL = request.params.shortURL;
  const longURL = request.body.longURL;
  if (userId) {
    urlDatabase[shortURL].longURL = longURL;
  }
  response.redirect(`/urls/${shortURL}`);
});
// remove urls
app.post("/urls/:shortURL/delete", (request, response) => {
  const userId = request.session["user_id"];
  if (userId) {
    const shortURL = request.params.shortURL;
    delete urlDatabase[shortURL];
  }
  response.redirect("/urls");
});



// register section -----------------------------------------------------------
// render register template
app.get("/register", (request, response) => {
  const userId = request.session["user_id"];
  const user = users[userId];
  const templateVars = { user };
  response.render("user-registration", templateVars);
});
// store when user email and password, but if exists, set status code and send message
app.post("/register", (request, response) => {
  const userId = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;
  if (!email) {
    return response.status(400).send("please enter email address");
  }
  if (!password) {
    return response.status(400).send("please enter password");
  }
  if (getUserByEmail(email, users)) {
    return response.status(400).send("the email address exist");
  }
  bcrypt.genSalt(10, (error, salt) => {
    console.log(salt);
    bcrypt.hash(password, salt, (error, hash) => {
      console.log(hash);
      
      const user = {
        id: userId,
        email,
        password: hash
      };
      users[userId] = user;
      console.log(users);
      request.session["user_id"] = userId;
      response.redirect("/urls");
    });
  });


});



// login section ---------------------------------------------------------------
// to render login template
app.get("/login", (request, response) => {
  const user = users[request.session["user_id"]];
  const templateVars = { user };
  response.render('user-login', templateVars);
});
// check email and password, and if correct then set cookie and redirect to urls page
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const user = getUserByEmail(email, users);
  const userId = user.id;
  if (!user) {
    return response.status(403).send("Please enter valid email address");
  }

  bcrypt.compare(password, user.password, (error, result) => {
    console.log(password);
    console.log(user.password);
    console.log(result);
    if (!result) {
      return response.status(403).send("Please enter valid password");
    }
    request.session["user_id"] = userId;
    response.redirect("/urls");
  });
});

// clear cookie when logout
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect('/login');
});



// worming up, not critical -----------------------------------------------------
app.get("/", (request, response) => {
  response.send("Hello!");
});
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});
app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body> </html>\n");
});



// server Listener --------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});