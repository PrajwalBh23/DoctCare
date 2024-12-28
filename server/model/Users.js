const mongoose = require('mongoose');       
const jwt = require('jsonwebtoken');        


const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    myprofile: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    meetingwith:{
        type: String,
        default: '',
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
});


// Generation of token
userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
        throw new Error('Token generation Failed');
    }
}

module.exports = mongoose.model("User", userSchema);