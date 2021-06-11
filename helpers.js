// get email and return user or false
const getUserByEmail = (email, database) => {
  for (const key in database) {
    const user = database[key];
    if (user.email === email) {
      return user;
    }
  }
  return null;
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

const urlsForUser = (id, database) => {
  const filteredObject = {};
  for (const key in database) {
    const userId = database[key].userId;
    if (userId === id) {
      filteredObject[key] = database[key];
    }
  }
  return filteredObject;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };