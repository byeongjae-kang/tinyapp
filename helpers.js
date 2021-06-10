// get email and return user or false
const getUserByEmail = (email, database) => {
  const keys = Object.keys(database);
  for (const key of keys) {
    const user = database[key];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { getUserByEmail };