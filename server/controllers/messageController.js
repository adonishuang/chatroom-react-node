const messageModel = require("../models/messageModel");

module.exports.addMessage = async (req, res, next) => {
    try {
        //获取请求数据
        const {from, to, message} = req.body;
        //创建存入数据库的数据
        const data = await messageModel.create({
            message: {text: message},
            users: [from, to],
            sender: from,
        })
        //返回信息
        if (data) return res.json({msg: "Message added successfully"});
        return res.json({msg: "Failed to add message to the database"});
    } catch (ex) {
        next(ex)
    }
}
module.exports.getAllMessage = async (req, res, next) => {
    try {
        //获取请求数据
        const {from, to} = req.body;
        //获取从数据库查找的结果
        const messages = await messageModel.find({
            users: {
                $all: [from, to],
            }
        }).sort({updatedAt:1});
        //区分消息来自发送者还是接受者
        const projectMessages = messages.map((msg)=>{
            return {
                fromSelf:msg.sender.toString() === from,
                message:msg.message.text,
            }
        });
        res.json(projectMessages);
    } catch (ex) {
        next(ex);
    }
}
