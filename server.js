var http = require('http').Server();
var fs = require('fs');
var IO = require('socket.io');

var io = IO(http);
console.log("Socket Secure server is up and running.");

// 所有用户名单
var allUsers = {};
// 所有客户端
var allSockets = {};

io.on('connect', function (socket) {
  var user = '';   //当前登录用户名

  socket.on('message', function(data) {
    var data = JSON.parse(data);
    switch (data.event) {
      //当有新用户加入时
      case "join":
        console.log("User joined", data.name);
        user = data.name;
        //当昵称重复时
        if(allUsers[user]) {
          sendTo(socket, {
            "event": "join",
            "message": "该用户名已存在, 请重新输入",
            "success": false
          });
        } else {
          //保存用户信息
          /*allUsers.push(user);*/
          allUsers[user] = true; //true表示未通话，false表示正在通话
          allSockets[user] = socket;
          socket.name = user;
          console.log(allUsers);
          sendTo(io, {
            "event": "join",
            "allUsers": allUsers,
            "success": true
          });
        }
        break;

      case "offer":
        //for example: UserA wants to call UserB
        console.log("Sending offer to: ", data.connectedUser);
        //if UserB exists then send him offer details
        var conn = allSockets[data.connectedUser];
        allUsers[data.connectedUser] = false;
        if(conn != null) {
          sendTo(io, {
            "event": "show",
            "allUsers": allUsers,
          });
          //setting that UserA connected with UserB
          socket.otherName = data.connectedUser;
          sendTo(conn, {
            "event": "offer",
            "offer": data.offer,
            "name": socket.name
          });
        } else {
          sendTo(socket, {
            "event": "msg",
            "message": "Not found this name"
          });
        }
        break;

      case "answer":
        console.log("Sending answer to: ", data.connectedUser);
        //for ex. UserB answers UserA
        var conn = allSockets[data.connectedUser];
        allUsers[data.connectedUser] = false;
        if(conn != null) {
          sendTo(io, {
            "event": "show",
            "allUsers": allUsers,
          });
          socket.otherName = data.name;
          sendTo(conn, {
            "event": "answer",
            "answer": data.answer
          });
        }
        break;

      case "candidate":
        console.log("Sending candidate to:", data.connectedUser);
        var conn = allSockets[data.connectedUser];
        if(conn != null) {
          sendTo(conn, {
            "event": "candidate",
            "candidate": data.candidate
          });
        }
        break;

      case "leave":
        console.log("Disconnecting from", data.connectedUser);
        var conn = allSockets[data.connectedUser];
        allUsers[data.connectedUser] = true;
        allUsers[socket.name] = true;
        socket.otherName = null;
        //notify the other user so he can disconnect his peer connection
        if(conn != null) {
          sendTo(io, {
            "event": "show",
            "allUsers": allUsers,
          });
          sendTo(conn, {
            event: "leave"
          });
        }
        break;
    }
  });

  socket.on("disconnect", function() {
    if(socket.name) {
      delete allUsers[socket.name];
      delete allSockets[socket.name];
      sendTo(io, {
        "event": "show",
        "allUsers": allUsers,
      });
      if(socket.otherName) {
        console.log("Disconnecting from ", socket.otherName);
        var conn = allSockets[socket.otherName];
        allUsers[socket.otherName] = true;
        socket.otherName = null;
        if(conn != null) {
          sendTo(conn, {
            type: "leave"
          });
        }
      }
    }
  });
});

function sendTo(connection, message) {
  connection.send(message);
}

http.listen(3000);