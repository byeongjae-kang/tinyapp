
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
      return user;
    }
  }
  return false;
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
  const userId = request.cookies["user_id"];
  const user = users[userId];
  const urls = urlsForUser(userId);
  const templateVars = { urls, user };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  const userId = request.cookies.user_id;
  const user =  users[userId];
  if (!user) {
    return response.redirect("/login");
  }

  const templateVars = { user };
  response.render("urls_new", templateVars);
});

//post url and redirect to /urls/:shortURL
app.post("/urls", (request, response) => {
  const randomString = generateRandomString();
  const longURL = request.body.longURL;
  const userId = request.cookies["user_id"];
  
  urlDatabase[randomString] = { longURL, userId };
  response.redirect(`/urls/${randomString}`);
});

// get request from client and render templates
app.get("/urls/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[request.cookies["user_id"]];
  const templateVars = { shortURL, longURL, user };
  response.render("urls_show", templateVars);
});

// get request from client and redirect to longURL: actual website
app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  response.redirect(longURL);
});

// post ruote to remove urls
app.post("/urls/:shortURL/delete", (request, response) => {
  const userId = request.cookies["user_id"];
  if (userId) {
    const shortURL = request.params.shortURL;
    delete urlDatabase[shortURL];
  }
  response.redirect("/urls");
});


// post route to edit longURL
app.post("/urls/:shortURL", (request, response) => {
  const userId = request.cookies["user_id"];
  const shortURL = request.params.shortURL;
  if (userId) {
    const longURL = request.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
  }
  response.redirect(`/urls/${shortURL}`);
});

// render register template
app.get("/register", (request, response) => {
  const user = users[request.cookies["user_id"]];
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
  const user = users[request.cookies["user_id"]];
  const templateVars = { user };
  response.render('user-login', templateVars);
});

// check email and password, and if correct then set cookie and redirect to urls page
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const user = checkUserExistsByEmail(email);
  const userId = user.id;

  if (!user) {
    return response.status(403).send("Please enter valid email address");
  }
  
  if (user.password !== password) {
    return response.status(403).send("Please enter valid password");
  }

  response.cookie("user_id", userId);
  response.redirect("/urls");
});

// clear cookie when logout
app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect('/login');
});

// server Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});