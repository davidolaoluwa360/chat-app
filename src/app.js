const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

//* servers
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//* configure paths
const publicDirPath = path.join(__dirname, "../public");

//* configure port for local and production environment
const port = process.env.PORT || 3001;

//* configure express to serve static files
app.use(express.static(publicDirPath));

//* Routes Middleware
app.get("", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(
          getUser(socket.id).user.username,
          `${user.username} has joined`
        )
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      callback("Profanicty is not allowed!");
    } else {
      io.to(user.user.room).emit(
        "message",
        generateMessage(user.user.username, message)
      );
      callback();
    }
  });

  socket.on("sendLocation", (position, callback) => {
    io.to(getUser(socket.id).user.room).emit(
      "locationMessage",
      generateLocationMessage(
        getUser(socket.id).user.username,
        `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("from remove", user);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(user.username, `${user.username} has left`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
