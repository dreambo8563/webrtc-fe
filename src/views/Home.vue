<template>
  <div>
    <div v-if="!regVisible && !showRoom">
      <div> Hi {{form.name}}, 你好! 这里是 1V1 聊天 Demo</div>
      <div>您可以选择一个房间进入,或者创建一个新的房间</div>
      <el-button @click="createRoom" type="primary">Create a Room</el-button>
      <el-button @click="joinRoom" type="primary">Join a Room</el-button>
    </div>
    <el-row v-show="showRoom" type="flex">
      <el-col :span="6">
        <div style="position:relative" v-show="showRoom">
          <video id="localVideo"></video>
          <video id="remoteVideo"></video>
        </div>
      </el-col>
      <el-col :span="12">
        <el-row style="height:300px">
          <p v-for="(v,i) of logs" :key="i">
            {{v}}
          </p>
        </el-row>
        <el-row>
          <div>
            <input v-model="msg" type="text">
            <el-button @click="send"> 发送</el-button>
          </div>
        </el-row>
      </el-col>
    </el-row>

    <el-dialog :close-on-click-modal="false" title="来聊天吧, 也许和你视频的是个妹子" :visible.sync="regVisible">
      <el-form :model="form">
        <el-form-item label="昵称" :label-width="formLabelWidth">
          <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="regVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const cfg = {
  iceServers: [
    {
      urls: ["turn:13.250.13.83:3478?transport=udp"],
      username: "YzYNCouZM1mhqhmseWk6",
      credential: "YzYNCouZM1mhqhmseWk6"
    }
  ]
};
const con = { optional: [{ DtlsSrtpKeyAgreement: true }] };

const sdpConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
};
let pc1 = new RTCPeerConnection(cfg, con);
let pc2 = new RTCPeerConnection(cfg, con);
export default {
  data() {
    return {
      regVisible: true,
      showRoom: false,
      msg: "",
      form: {
        name: ""
      },
      formLabelWidth: "120px",
      dc1: null,
      activedc: null,
      logs: [],
      socket: null
    };
  },
  methods: {
    createRoom() {
      this.socket.addEventListener("message", res => {
        const data = JSON.parse(res.data);
        // console.log(data)
        if (data.answer) {
          // console.log("answer", offer)
          // const offer = JSON.parse(data.answer)
          const answerDesc = new RTCSessionDescription(JSON.parse(data.answer));
          // console.log("Received remote answer: ", answerDesc)
          // writeToChatLog("Received remote answer", "text-success")
          pc1.setRemoteDescription(answerDesc);
          this.socket.close();
        }
        // console.log(data)
      });
      this.socket.addEventListener("close", res => {
        console.log("close", this.form.name);
      });
      this.$prompt("请输入房间名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.room = value;
          this.showRoom = true;
          navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
          navigator.getUserMedia(
            { video: true, audio: false },
            stream => {
              var video = document.getElementById("localVideo");
              video.srcObject = stream;
              video.play();
              pc1.addStream(stream);
              // console.log(stream)
              // console.log("adding stream to pc1")
              this.setupLocalDataChannel();
              pc1.createOffer(sdpConstraints).then(desc => {
                pc1.setLocalDescription(desc);
                // console.log("created local offer", desc)
              });
            },
            function(error) {
              console.log("Error adding stream to pc1: " + error);
            }
          );
          pc1.onicecandidate = e => {
            // console.log("ICE candidate (pc1)", e)
            if (e.candidate == null) {
              // console.log(pc1, "pc1", pc1.localDescription)
              // "create", JSON.stringify(pc1.localDescription)
              this.socket.send(
                JSON.stringify({
                  type: "create",
                  message: JSON.stringify(pc1.localDescription),
                  room: this.room,
                  user: this.form.name
                })
              );
              // $("#localOffer").html(JSON.stringify(pc1.localDescription))
            }
          };
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    setupLocalDataChannel() {
      this.dc1 = pc1.createDataChannel(this.form.name, { reliable: true });
      this.activedc = this.dc1;
      this.dc1.onopen = e => {
        console.log("data channel connect");
        // $("#waitForConnection").modal("hide")
        // $("#waitForConnection").remove()
        this.activedc.send("$close$");
      };
      this.dc1.onmessage = e => {
        console.log("Got message (pc1)", e.data);
        this.logs.push(e.data);
      };
    },
    joinRoom() {
      this.socket.addEventListener("message", res => {
        const data = JSON.parse(res.data);
        // console.log(data)
        if (data.offer) {
          // console.log("offer", offer)
          // const offer = JSON.parse(data.offer)
          const offerDesc = new RTCSessionDescription(JSON.parse(data.offer));
          // console.log(vm.methods)
          this.setOffer(offerDesc);
        }
        // console.log(data)
      });
      // this.socket.addEventListener("close", res => {
      //   this.socket.send(
      //     JSON.stringify({
      //       type: "close"
      //     })
      //   )
      // })
      this.socket.addEventListener("error", res => {
        this.socket.send(
          JSON.stringify({
            type: "error"
          })
        );
      });
      this.socket.addEventListener("close", res => {
        console.log("close", this.form.name);
      });
      this.$prompt("请输入房间名", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.room = value;
          navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
          navigator.getUserMedia(
            { video: true, audio: true },
            stream => {
              var video = document.getElementById("localVideo");
              video.srcObject = stream;
              video.play();
              pc2.addStream(stream);
              this.showRoom = true;
              this.socket.send(
                JSON.stringify({
                  type: "join",
                  message: "",
                  room: this.room,
                  user: this.form.name
                })
              );
            },
            function(error) {
              console.log("Error adding stream to pc2: " + error);
            }
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    setOffer(desc) {
      pc2.onicecandidate = e => {
        console.log("ICE candidate (pc2)", e);
        if (e.candidate == null) {
          // $("#localAnswer").html(JSON.stringify(pc2.localDescription))
          this.socket.send(
            JSON.stringify({
              type: "answer",
              message: JSON.stringify(pc2.localDescription),
              room: this.room,
              user: this.form.name
            })
          );
        }
      };
      // console.log(desc, "desc")
      pc2.setRemoteDescription(desc);
      pc2.createAnswer(sdpConstraints).then(answerDesc => {
        // writeToChatLog("Created local answer", "text-success")
        // console.log("Created local answer: ", answerDesc)
        pc2.setLocalDescription(answerDesc);
      });
    },
    handleOnaddstream(e) {
      console.log("Got remote stream", e.stream);
      var el = document.getElementById("remoteVideo");
      el.autoplay = true;
      el.srcObject = e.stream;
    },
    send() {
      if (this.msg) {
        this.activedc.send(this.msg);
        this.logs.push(this.msg);
        this.msg = "";
      }
    }
  },
  beforeRouteEnter: (to, from, next) => {
    // console.log(to, from)
    const ws = new WebSocket("wss://" + window.location.host + "/ws");
    // const ws = new WebSocket("ws://localhost:7000/ws")
    ws.addEventListener("open", function(event) {
      // console.log(event)
      next(vm => {
        vm.socket = ws;
      });
    });
  },
  mounted() {
    // pc1.onconnection = this.handleOnconnection
    pc2.onaddstream = this.handleOnaddstream;
    pc1.onaddstream = this.handleOnaddstream;
    // pc2.onconnection = this.handleOnconnection

    pc2.ondatachannel = e => {
      // var fileReceiver2 = new FileReceiver()
      let datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
      // console.log("Received datachannel (pc2)", arguments)
      let dc2 = datachannel;
      this.activedc = dc2;
      dc2.onopen = function(e) {
        console.log("data channel connect");
      };
      dc2.onmessage = e => {
        console.log("Got message (pc2)", e.data);
        if (e.data === "$close$") {
          this.socket.close();
        } else {
          this.logs.push(e.data);
        }
      };
    };
  },
  beforeDestroy() {
    console.log("close");
    this.socket.send(
      JSON.stringify({
        type: "close"
      })
    );
  }
};
</script>

<style scoped lang="scss">
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
}
#localVideo {
  position: absolute;
  width: 20%;
}
#remoteVideo {
  width: 100%;
}
</style>
