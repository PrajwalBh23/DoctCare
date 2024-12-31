const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    myImage: {
        type: String,
        default: '' // Add default if not required
    },
    name: {
        type: String,
        required: true,
        // unique: true
    },
    phone: {
        type: Number,
        required: true,
        // unique: true
    },
    email: {
        type: String,
        // required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        default: ''
    },
    roomurl:{
        type: String,
        default: '',
    },
    meetingwith:{
        type: String,
        default: '',
    },
    age:{
        type: String,
    },
    weight:{
        type: String,
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
        let token = jwt.sign({ _id: this._id, isCounsellor: this.isCounsellor }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        // Add the token to the user's token array and save
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
        throw new Error('Token generation Failed');
    }
}

module.exports = mongoose.model("Doctor", userSchema);