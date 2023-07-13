const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const mongoose = require('mongoose');
const userRoute = require("./routes/userRoute")
const messageRoute = require("./routes/messageRoute")
const socket = require("socket.io")
require("dotenv").config();


app.use(express.json());

app.use("/api/auth", userRoute)
app.use("/api/messages", messageRoute)
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connection Success")
}).catch((err) => {
    console.log(err.message)
})
//重大BUG
const server = app.listen(5050, () => {
    console.log(`Server Started on Port : ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
})
//全局对象
global.onlineUsers = new Map();

//监测是否有链接
io.on("connection", (socket) => {
    global.chatSocket = socket;
    //监听前端发送"add-user"
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    })
    socket.on("send-msg",(data)=>{
        console.log(onlineUsers)
        console.log("aaa",data)
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-receive",data.messages)
        }
    })
})
