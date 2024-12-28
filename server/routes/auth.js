const express = require("express");
const { register, login, isLogin } = require("../controllers/auth.js");
const { isAuthenticated } = require("../controllers/auth.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/isLogin", isAuthenticated, isLogin);

module.exports = router; 
