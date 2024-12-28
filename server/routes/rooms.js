const express = require("express");
const { update_details, get_details, getAllDoctors, booking, notify, meeting } = require("../controllers/controller.js");
const { isAuthenticated } = require("../controllers/auth.js");

const router = express.Router();

router.get('/get_details', isAuthenticated, get_details);
router.post('/profile', isAuthenticated, update_details);
router.get('/get_Doctors', getAllDoctors);
router.post('/notification', isAuthenticated, notify);
router.patch('/book', isAuthenticated, booking); // working
router.get('/meeting', isAuthenticated, meeting);

module.exports =  router;