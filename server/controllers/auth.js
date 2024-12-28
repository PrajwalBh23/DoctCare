const User = require('../model/Users.js');  // Use `const` to declare User
const Doctor = require('../model/Doctors.js');  // Use `const` to declare User
const bcrypt = require('bcrypt');           // Use `const` to declare bcrypt
const jwt = require('jsonwebtoken');        // Use `const` to declare jwt
const dotenv = require('dotenv');           // Use `const` to declare dotenv

dotenv.config();


const register = async (req, res, next) => {
    try {
        const { name, email, phone, password, isCounsellor } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password || !phone) {
            return res.status(422).json({ error: "Please fill in all the fields properly" });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        let newUser;

        if (isCounsellor) {
            newUser = new Doctor({
                name,
                email,
                phone,
                password: hash,
            });
        } else {
            newUser = new User({
                name,
                email,
                phone,
                password: hash,
            });
        }

        // Save the user and generate a token
        await newUser.save();

        // Include the isCounsellor field in the token payload
        const token = jwt.sign({ id: newUser._id, isCounsellor: !!isCounsellor }, process.env.SECRET_KEY);

        // console.log(newUser);

        // Return the token and isCounsellor status in the response
        res.status(200).json({
            message: "User has been created",
            token,
            isCounsellor: !!isCounsellor  // Ensure boolean value is sent
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill in the data' });
        }

        // Find the user in either User or Professional collections
        const user = await User.findOne({ email }) || await Doctor.findOne({ email });

        // If user not found, return an error
        if (!user) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        // Compare the password with the stored hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // If password doesn't match, return an error
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        // Check if the user is a counsellor (Professional)
        const isCounsellor = user instanceof Doctor;

        // Generate JWT token with isCounsellor flag if the user is a counsellor
        const tokenPayload = { id: user._id };
        if (isCounsellor) {
            tokenPayload.isCounsellor = true;
        }

        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY);

        // Send the token in the response with a cookie
        res.cookie("JwtToken", token, {
            expires: new Date(Date.now() + 259200000),  // Cookie expiry set for 3 days
            httpOnly: true,  // Ensures the cookie can't be accessed via JavaScript
        });

        // console.log(isCounsellor);

        // Respond with token and isCounsellor flag (if applicable)
        return res.status(200).json({
            message: "User signed in successfully",
            token,
            isCounsellor: isCounsellor || false  // Ensure the flag is always sent as a boolean
        });

    } catch (error) {
        next(error);
    }
};


const isLogin = async (req, res) => {
    try {

        const user = await User.findById(req.user._id) || await Doctor.findById(req.user._id);

        if (user) {
            // console.log("getto user");
            return res.status(200).json({
                success: true,
            })
        } else {
            // console.log("not getto user");
            return res.status(200).json({
                success: true,
            })
        }

    } catch (err) {
        console.log("all error");
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const isAuthenticated = (req, res, next) => {
    
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            console.log("success is half");
            return res.status(401).json({
                success: false,
                message: "Missing Token"
            })
        }

        jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                })
            }
            req.user = await User.findById(user.id) || await Doctor.findById(user.id);
            const gello = await User.findById(user.id);
            next()
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports = { register, login, isLogin, isAuthenticated }; 