import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Edit } from '@material-ui/icons';
import Header from './Header';
import "./Styles/profile.css";
import { TextField } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { API } from '../AuthContext';

// Here The counselling is saving but not showing

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    profilePhoto: '',
  });
  const location = useLocation(); // Use useLocation to access route state
  const { state } = location;
  const tokenFromUrl = state ? state.token : null; // Access token from route state
  const [imagePreview, setImagePreview] = useState(null);
  

  // Create a ref for the file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch profile data from backend
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      try {
        const response = await axios.get(`${API}/routes/get_details`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in request header
          },
        });
        const formattedCounselling = Array.isArray(response.data.counselling)
          ? response.data.counselling.join('\n') // Join array elements with newline
          : response.data.counselling;

        // Fetch the profile photo from backend if available
        const Image_getting = response.data.myImage;

        if (Image_getting) {
          // Set the profile photo (base64 string) as the preview image
          setImagePreview(Image_getting);
        }

        // Merge fetched data with existing profileData
        setProfileData(prevData => ({
          ...prevData,
          ...response.data,
          counselling: formattedCounselling, // Update counselling with formatted string
          profilePhoto: Image_getting || '' // Set profile photo
        }));

      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);


  // Function to handle when the user clicks the profile photo
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  // Handle file input change for the profile photo
  const handlePhotoChange = async (event) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      setProfileData(prevData => ({ ...prevData, profilePhoto: base64 }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsDataURL(file);
    });
  };


  const handleInputChange = (e) => {
    const { name, value, type, options } = e.target;

    if (type === 'select-multiple') {
      // Handle multiple select values
      const values = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setProfileData({ ...profileData, [name]: values });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };


  // Handle form submission to save profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Add fields to the form data
    for (const [key, value] of Object.entries(profileData)) {
      if (Array.isArray(value)) {
        value.forEach(val => formData.append(`${key}[]`, val));
      } else {
        formData.append(key, value);
      }
    }

    const token = tokenFromUrl || localStorage.getItem('token');

    try {
      const response = await axios.post(`${API}/routes/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert('Profile updated successfully');
      } else {
        console.error('Failed to update profile:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };



  return (
    <>
      <Header />

      <div className="profile-page">
        <div className="profile-left">
          <div className="profile-photo-section">
            <div className="photo-wrapper">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="profile-photo-preview"
                    onClick={handleImageClick} // Click handler to show dropdown
                  />
                  <Edit style={{ display: "none" }}
                    className="edit-icon"
                    onClick={handleImageClick} // Click handler to toggle dropdown
                  />
                </>
              ) : (
                <div className="default-photo" onClick={handleImageClick}>
                  Upload Photo
                  <Edit
                    className="edit-icon"
                    onClick={handleImageClick} // Click handler to toggle dropdown
                  />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              name="profilePhoto"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />

            <div className="profile-name">
              <h3>{profileData.name || 'Your Name'}</h3>
            </div>
          </div>
        </div>

        <div className="profile-right">
          <form className='flexing_part' onSubmit={handleSubmit}>
            <div className="profile-field">
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                style={{ marginBottom: "20px" }}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: "1.5rem", // Adjust font size
                    color: 'black', // Text color
                    backgroundColor: 'white', // Background color

                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '1.5rem', // Adjust font size for label
                    color: 'black', // Label color
                  }

                }}
              />
            </div>

            <div className="profile-field">
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                style={{ marginBottom: "20px" }}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: "1.5rem",
                    color: 'black', // Text color
                    backgroundColor: 'white', // Background color

                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '1.5rem', // Label font size
                    color: 'black', // Label color
                  }
                }}
              />
            </div>

            <div className="profile-field">
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                style={{ marginBottom: "20px" }}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: "1.5rem",
                    color: 'black', // Text color
                    backgroundColor: 'white', // Background color

                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '1.5rem', // Label font size
                    color: 'black', // Label color
                  }
                }}
              />
            </div>

            <div className="profile-field">
              <TextField
                label="Degree"
                variant="outlined"
                fullWidth
                name="education"
                value={profileData.education}
                onChange={handleInputChange}
                style={{ marginBottom: "20px" }}
                InputProps={{
                  style: {
                    fontSize: "1.5rem",
                    color: 'black', // Text color
                    backgroundColor: 'white', // Background color

                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '1.5rem', // Label font size
                    color: 'black', // Label color
                  }
                }}
              />
            </div>
          </form>
          <button className='center' type="submit" onClick={handleSubmit}>Save Profile</button>
        </div>
      </div>
    </>
  );
};

export default Profile;
