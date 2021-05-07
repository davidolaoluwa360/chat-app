const users = [];

//* Add User
const addUser = ({ id, username, room }) => {
  //* clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //* validate data
  if (!username || !room) {
    return {
      error: `Username and room are required`,
    };
  }

  //* check for an existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //* validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //* Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//* Get User
const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });

  return {
    user,
  };
};

//* Get Users in a room
const getUserInRoom = (room) => {
  let userData = users.filter((user) => {
    return user.room === room;
  });
  return {
    users: userData,
  };
};

//* Remove User
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

module.exports = {
  getUser,
  getUserInRoom,
  addUser,
  removeUser,
};
