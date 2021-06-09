
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan('dev'));

// when user add longURL random shortURL and longURL stored in here
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// string to be used as shortURL
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

// to check if the user exists
const checkUserExistsByEmail = (email) => {
  const keys = Object.keys(users);
  for (const key of keys) {
    const user = users[key];
    if (user.email === email) {
      return email;
    }
  }
  return false;
};

// this makes request body readable
app.use(express.urlencoded({ extended: false }));

// worming up, not critical
app.get("/", (request, response) => {
  response.send("Hello!");
});
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});
app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body> </html>\n");
});



// get request from client and render templates
app.get("/urls", (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[request.cookies["user_id"]]
  };
  response.render("urls_index", templateVars);
});
app.get("/urls/new", (request, response) => {
  const templateVars = {
    user: users[request.cookies["user_id"]]
  };
  response.render("urls_new", templateVars);
});

//post url and redirect to /urls/:shortURL
app.post("/urls", (request, response) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`);
});

// get request from client and render templates
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    user: users[request.cookies["user_id"]]
  };
  response.render("urls_show", templateVars);
});

// get request from client and redirect to longURL: actual website
app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// post ruote to remove urls
app.post("/urls/:shortURL/delete", (request, response) => {
  const url = request.params.shortURL;
  delete urlDatabase[url];
  response.redirect("/urls");
});


// post route to edit longURL
app.post("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

// render register template
app.get("/register", (request, response) => {
  const templateVars = {
    user: users[request.cookies["user_id"]]
  };
  response.render("user-registration", templateVars);
});

// store when user email and password, but if exists, set status code and send message
app.post("/register", (request, response) => {
  const userId = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;
  
  if (!email || !password) {
    return response.status(400).send("please enter valid email address and password");
  }

  if (checkUserExistsByEmail(email)) {
    return response.status(400).send("the email address exist");
  }
  
  const user = {
    id: userId,
    email,
    password
  };
  users[userId] = user;
  response.cookie("user_id", userId);
  response.redirect("/urls");
});

// to render login template
app.get("/login", (request, response) => {
  const templateVars = {
    user: users[request.cookies["user_id"]]
  };
  response.render('user-login', templateVars);
});

// get cookie when login
app.post("/login", (request, response) => {
  const username = request.body.username;
  response.cookie('username', `${username}`);
  response.redirect('/urls');
});

// clear cookie when logout
app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect('/urls');
});



// server Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});