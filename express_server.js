// require express
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set ejs
app.set("view engine", "ejs");

// initial data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

//post url and redirect to /urls/:shortURL
app.post("/urls", (request, response) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`);
});

// get request from client and render templates
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL]};
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

// server Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});