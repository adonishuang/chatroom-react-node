const User = require("../models/userModel")
const bcrypt = require("bcrypt")

module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body
        const usernameCheck = await User.findOne({username});
        if (usernameCheck) {
            return res.json({msg: "Username already use", status: false});
        }
        const emailCheck = await User.findOne({email});
        if (emailCheck) {
            return res.json({msg: "Email already use", status: false});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        })
        delete user.password;
        return res.json({status: true, user});
    } catch (ex) {
        next(ex);
    }
};
module.exports.login = async (req, res, next) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username});
        if (!user) {
            return res.json({msg: "Incorrect username", status: false});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({msg: "Incorrect password", status: false});
        }
        delete user.password;
        return res.json({status: true, user});
    } catch (ex) {
        next(ex);
    }
}
module.exports.setAvatar = async (req, res, next) => {
    try {
        //获取请求的id
        const userId = req.params.id;
        //获取请求的image数据
        const avatarImage = req.body.image;
        //找到并更新user
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage,
        });
        //返回给前端
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        })
    } catch (ex) {
        next(ex);
    }
}
module.exports.getAllUsers = async (req, res, next) => {
    try {
        //通过id获取所有用户，但不包括登陆用户,select选择性获取用户内容
        const users = await User.find({_id:{$ne:req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex)
    }
}
