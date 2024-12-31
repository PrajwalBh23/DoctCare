const User = require('../model/Users.js');  // Use `const` to declare User
const Doctor = require('../model/Doctors.js');


const get_details = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you're getting user ID from the JWT or session
    const user = await User.findById(userId, 'name email phone age weight') || await Doctor.findById(userId, 'myImage name email phone education age weight'); // Fetch only name, email, and phone
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}


const update_details = async (req, res) => {
  // console.log('Request Body:', req.body);

  const {
    name,
    email,
    phone,
    education,
    profilePhoto,
  } = req.body;

  const userId = req.user.id; 

  const myImage = profilePhoto;

  try {
    const updatedProfile = await Doctor.findOneAndUpdate(
      { _id: userId },
      {
        name,
        email,
        phone,
        education,
        myImage,
      },
      { new: true, runValidators: true } // Add runValidators if you have validation rules
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error); // Log the full error object
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};


const getAllDoctors = async (req, res) => {
  try {
    // Fetching all professionals with specific fields
    const doctors = await Doctor.find();

    if (!doctors || doctors.length === 0) {
      console.log("here not found");
      return res.status(404).json({ message: 'No doctors found' });
    }
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


const booking = async (req, res) => {
  const { expertId, userId } = req.body;

  const io = req.app.get('io'); // Get Socket.io instance from app

  try {
    // Find the expert (doctor) by their ID
    const expert = await Doctor.findById(expertId);

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Find the user by their ID to get the name
    const user = await User.findById(userId); // Assuming you have a User model
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set the meeting to a specific time or description
    expert.meetingwith = userId;
    await expert.save(); // Save the updated expert information

    // Emit to the expert's room or socket ID with the user's name
    io.emit('newBooking', {
      userID: expertId,
      message: `You have a new booking from user ${user.name}.`, // Use user.name instead of userId
    });

    return res.status(200).json({
      success: true,
      message: 'Booking successful. Notification sent to Doctor.',
    });
  } catch (error) {
    console.error('Error booking expert:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const notify = async (req, res) => {

  const expertID = req.user.id;

  const io = req.app.get('io'); // Get Socket.io instance from app

  try {

    const expert = await Doctor.findById(expertID);

    const userId = expert.meetingwith;

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    expert.meetingwith = '';
    await expert.save();

    io.emit('decline', {
      userID: userId,
      message: "Booking Decline.",
    });

    return res.status(200).json({ message: 'Decline Successfully' });

  } catch (error) {
    console.error('Error handling booking response:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const meeting = async (req, res) => {
  const { roomurl, userId } = req.query;
  const io = req.app.get('io');
  const doctor = userId;

  try {

    const expert = await Doctor.findById(doctor);

    const userId = expert.meetingwith;
    const user = await User.findById(userId); 

    expert.age = user.age; 
    expert.weight = user.weight; 
    
    await expert.save();


    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    io.emit('joining', {
      userID: userId,
      Roomurl :roomurl,
      message: "Joining the room",
    });

    return {
      message: "Meeting URL send successfully ",
    };

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


module.exports = { get_details, update_details, getAllDoctors, booking, notify, meeting }; 