const socket = io();

//* Elements
const $messageForm = document.getElementById("form");
const $messageFormInput = $messageForm.querySelector("#message");
const $messageFormButton = $messageForm.querySelector("button");
const messageWrapper = document.querySelector("#displayMessage");
const sendLocation = document.getElementById("send-location");
const messages = document.querySelector("#messages");
const sidebar = document.querySelector("#sidebar");

//* Templates
const messageTemplate = document.querySelector("#template-message").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//* Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //* New message element
  const $newMessage = messages.lastElementChild;

  //* message height
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //* Visible height
  const visibleHeight = messages.offsetHeight;

  //* height of messages container
  const containerHeight = messages.scrollHeight;

  //* How far have i scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
};

$messageForm.addEventListener("submit", (e) => {
  //* disable the form
  $messageFormButton.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", $messageFormInput.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      console.log(error);
    }
    console.log("This message was delivered");
  });
  e.preventDefault();
});

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    username: message.username,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

sendLocation.addEventListener("click", (e) => {
  sendLocation.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Your browser does not support Geolocation");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocation.removeAttribute("disabled");
        console.log("location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users.users,
  });
  sidebar.innerHTML = html;
});
