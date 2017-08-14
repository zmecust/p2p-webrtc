<template>
    <div>
        <div class="container text-center" v-show="show">
            <div class="row">
                <div class="col-md-4 col-md-offset-4">
                    <form class="form" action="" @submit.prevent="submit()">
                        <h2>WebRTC Video Demo. Please Sign In</h2><br/>
                        <input class="form-control" type="text" placeholder="请输入您的昵称"
                               required="" autofocus="" v-model="user_name"><br/>
                        <button class="btn btn-primary btn-block" type="submit">创建昵称</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="container text-center" v-show="! show">
            <div class="row">
                <div class="col-md-3" style="height: 50%">
                    <ul class="list-group">
                        <li class="list-group-item">昵称: {{user_name}}</li>
                        <li class="list-group-item">当前在线人数: {{Object.getOwnPropertyNames(users).length - 1}}</li>
                        <li class="list-group-item">在线用户:
                            <div v-for="(user, index) in users">
                                <br><span>{{index}}</span>
                                <span :class="[user ? 'green_color' : 'red_color']">{{user ? '(在线)' : '(正在通话)'}}</span>
                            </div>
                        </li>
                    </ul>
                    <div class="row text-center">
                        <div class="col-md-12">
                            <input class="form-control" type="text" v-model="call_username" placeholder="username to call"/>
                            <br>
                            <button class="btn-success btn" @click="call">Call</button>
                            <button class="btn-danger btn" @click="hangUp">Hang Up</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <video id="localVideo" :src="local_video" autoplay></video>
                    <video id="remoteVideo" :src="remote_video" autoplay></video>
                </div>
            </div>
        </div>
        <div class="preview" v-show="accept_video">
            <div class="preview-wrapper">
                <div class="preview-container">
                    <div class="preview-body">
                        <h4>您有视频邀请，是否接受?</h4>
                        <button class="btn-success btn" @click="accept">接受</button>
                    </div>
                    <div class="confirm" @click="closePreview">×</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
  window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

  const socket = io.connect('http://localhost:3000');
  var stream;
  var peerConn;
  var connectedUser = null;
  var configuration = {
        "iceServers": [
          { "url": "stun:stun.l.google.com:19302" },
          { "url": "turn:115.28.170.217:3478", "credential": "zmecust", "username": "zmecust" }
        ]
      };

  export default {
    data() {
      return {
        user_name: '',
        show: true,
        users: '',
        call_username: '',
        local_video: '',
        remote_video: '',
        accept_video: false
      }
    },
    mounted() {
      socket.on('message', function (data) {
        console.log(data);
        switch (data.event) {
          case "show":
          this.users = data.allUsers;
          break;
          case "join":
          this.handleLogin(data);
          break;
          case "call":
          this.handleCall(data);
          break;
          case "accept":
          this.handleAccept();
          break;
          case "offer":
          this.handleOffer(data);
          break;
          case "candidate":
          this.handleCandidate(data);
          break;
          case "msg":
          this.handleMsg(data);
          break;
          case "answer":
          this.handleAnswer(data);
          break;
          case "leave":
          this.handleLeave();
          break;
          default:
          break;
      }
      }.bind(this));
    },
    methods: {
      submit() {
        if (this.user_name != '') {
          this.send({
            event: "join",
            name: this.user_name,
          });
        }
      },
      send(message) {
        if (connectedUser != null) {
          message.connectedUser = connectedUser;
        }
        socket.send(JSON.stringify(message));
      },
      handleLogin(data) {
        let self = this;
        if (data.success === false) {
          alert("Ooops...please try a different username");
        } else {
          this.show = false;
          this.users = data.allUsers;
          this.initCreate();
        }
      },
      initCreate() {
        let self = this;
        peerConn = new RTCPeerConnection(configuration);
        navigator.getUserMedia({ video: true, audio: true }, gotStream, logError);
        function gotStream(stream) {
          //displaying local video stream on the page
          self.local_video = window.URL.createObjectURL(stream);
          peerConn.addStream(stream);
        }
        function logError(error) {
          console.log(error);
        }
        peerConn.onaddstream = function (e) {
          self.remote_video = window.URL.createObjectURL(e.stream);
        };
        peerConn.onicecandidate = function (event) {
          console.log(event.target.iceGatheringState);
          if (event.candidate) {
            self.send({
              event: "candidate",
              candidate: event.candidate
            });
          }
        };
      },
      call() {
        if (this.call_username.length > 0) {
          if (this.users[this.call_username] === true) {
            connectedUser = this.call_username;
            this.send({
                event: "call"
            });
          } else {
            alert("The current user is calling, try another");
          }
        } else {
          alert("Ooops...this username cannot be empty, please try again");
        }
      },
      handleCall(data) {
        this.accept_video = true;
        connectedUser = data.name;
      },
      accept() {
        this.send({
          event: "accept",
          accept: true
        });
        this.accept_video = false;
      },
      handleAccept() {
        var self = this;
        // create an offer
        peerConn.createOffer(function (offer) {
          self.send({
            event: "offer",
            offer: offer
          });
          peerConn.setLocalDescription(offer);
        }, function (error) {
          alert("Error when creating an offer");
        });
      },
      handleOffer(data) {
        var self = this;
        connectedUser = data.name;
        peerConn.setRemoteDescription(new RTCSessionDescription(data.offer));
        //create an answer to an offer
        peerConn.createAnswer(function (answer) {
          peerConn.setLocalDescription(answer);
          self.send({
            event: "answer",
            answer: answer
          });
        }, function (error) {
            alert("Error when creating an answer");
        });
      },
      handleMsg(data) {
        console.log(data.message);
      },
      handleAnswer(data) {
        peerConn.setRemoteDescription(new RTCSessionDescription(data.answer));
      },
      handleCandidate(data) {
        //ClientB通过PeerConnection的AddIceCandidate方法保存起来
        peerConn.addIceCandidate(new RTCIceCandidate(data.candidate));
      },
      hangUp() {
        this.send({
          event: "leave"
        });
        this.handleLeave();
      },
      handleLeave() {
        alert("通话已结束");
        connectedUser = null;
        this.remote_video = "";
        peerConn.close();
        peerConn.onicecandidate = null;
        peerConn.onaddstream = null;
        if (peerConn.signalingState == 'closed') {
          this.initCreate();
        }
      },
      closePreview() {
        this.accept_video = false;
      }
    }
  }
</script>

<style>
    .preview {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .5);
        display: table;
        transition: opacity .3s ease;
    }
    .preview-wrapper {
        display: table-cell;
        vertical-align: middle;
    }
    .preview-container {
        width: 400px;
        height: 150px;
        margin: 0px auto;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Helvetica, Arial, sans-serif;
        position: relative;
    }
    .confirm {
        position: absolute;
        right: 10px;
        top: 0px;
        font-size: 40px;
    }
    .confirm:hover {
        color: red;
        cursor: pointer;
    }
    .preview-body {
        position: absolute;
        width: 380px;
        height: 130px;
        margin: 10px 10px 10px 10px;
    }
    .preview-body > h4 {
        position: absolute;
        top: 25%;
        left: 20%;
    }
    .preview-body > button {
        position: absolute;
        right: 10px;
        bottom: 0px;
    }
    .green_color {
        color: green;
    }
    .red_color {
        color: red;
    }
</style>
