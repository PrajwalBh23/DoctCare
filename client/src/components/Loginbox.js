import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useAuth, API } from '../AuthContext';
import './Styles/Loginbox.css';

const LoginBox = ({ open, handleClose, isRegistering }) => {
  const { register, login, loginOrNot } = useAuth(); // Use the useAuth hook
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // Keep phone number empty initially
  const [newPassword, setNewPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isCounsellor, setIsCounsellor] = useState(false);
  const [isRegisteringState, setIsRegisteringState] = useState(isRegistering);

  useEffect(() => {
    const checkLoginStatus = async () => {
      await loginOrNot(); // Check if user is logged in
      setUserLoggedIn(true); // Set userLoggedIn state to true
    };

    checkLoginStatus();
  }, [loginOrNot]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password, age, weight }),
      });

      if (!response.ok) {
        throw new Error(`Error during login: ${response.statusText}`);
      }

      const data = await response.json();
      const { token } = data;
      login(token);
      localStorage.setItem('token', token);
      alert('Login successful');
      handleClose();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password, isCounsellor }),
      });

      if (!response.ok) {
        throw new Error(`Error during registration: ${response.statusText}`);
      }

      const data = await response.json();
      const { token } = data;
      register(token);
      localStorage.setItem('token', token);
      alert('Register successful');
      handleClose();
    } catch (error) {
      console.error('Error during registration:', error.message);
      if (error.message.includes('OTP')) {
        alert('Invalid OTP');
      }
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
  };

  const handleResetPassword = () => {
    console.log('Resetting password with:', email, newPassword);
    setIsForgotPassword(false);
  };

  const handleToggleForm = () => {
    setIsRegisteringState(!isRegisteringState);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h3" component="div" sx={{ textAlign: 'center' }}>
          {isRegisteringState ? 'Register' : 'Login'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '350px',
              padding: '20px',
              borderRadius: '5px',
              backgroundColor: 'transparent',
              border: '1px solid #dfdfdf',
              boxSizing: 'border-box',
            }}
          >
            {isForgotPassword ? (
              <>
                <TextField
                  label="Phone"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputProps={{
                    style: { fontSize: '16px' }, // Adjust font size for input text
                  }}
                  InputLabelProps={{
                    style: { fontSize: '16px' }, // Adjust font size for label text
                  }}
                  style={{
                    marginBottom: '20px',
                    height: '50px', // Set consistent height
                  }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  inputProps={{
                    style: {
                      fontSize: '16px',
                      height: '50px',
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      fontSize: '16px',
                      height: '50px',
                    },
                  }}
                  style={{
                    marginBottom: '20px',
                    height: '50px', // Set consistent height
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  inputProps={{
                    style: { fontSize: '16px', height: '50px' },
                  }}
                  InputLabelProps={{
                    style: { fontSize: '16px', height: '50px' },
                  }}
                  style={{
                    marginBottom: '20px',
                    height: '50px',
                  }}
                />
                <Button
                  onClick={handleResetPassword}
                  color="primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '18px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    background: '#44a0dc',
                    color: 'white',
                  }}
                >
                  Reset Password
                </Button>
              </>
            ) : (
              <form>
                {isRegisteringState && (
                  <TextField
                    label="Name"
                    fullWidth
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px' },
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px' },
                    }}
                    style={{
                      marginBottom: '20px',
                      height: '50px',
                    }}
                  />
                )}
                {isRegisteringState && (
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px' },
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px' },
                    }}
                    style={{
                      marginBottom: '20px',
                      height: '50px',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px' }, // Consistent font size and height
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px' }, // Consistent font size for label
                    }}
                    style={{
                      height: '50px',
                      flex: 1, // Allow TextField to take remaining space
                    }}
                  />
                </div>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputProps={{
                    style: { fontSize: '16px', height: '50px' },
                  }}
                  InputLabelProps={{
                    style: { fontSize: '16px', height: '50px' },
                  }}
                  style={{
                    marginBottom: '20px',
                    height: '50px',
                  }}
                />
                {isRegisteringState && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '20px',
                      fontSize: '14px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCounsellor} // Updated to checked={isCounsellor}
                      onChange={(e) => setIsCounsellor(e.target.checked)}
                      style={{
                        width: '14px',
                        height: '14px',
                        marginRight: '4px',
                      }}
                      disabled
                    />
                    Register as Doctor
                  </label>
                )}
                {!isRegisteringState && (
                  <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                  }}
                >
                  <TextField
                    label="Age (in yrs.)"
                    fullWidth
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px', height: '20px' },
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px', height: '20px' },
                    }}
                    style={{
                      marginBottom: '20px',
                      height: '20px',
                      flex: 1, // Ensures the input takes equal space
                      marginRight: '10px', // Adds space between Age and Weight inputs
                    }}
                  />
                
                  <TextField
                    label="Weight (in kg)"
                    fullWidth
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px', height: '20px' },
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px', height: '20px' },
                    }}
                    style={{
                      marginBottom: '20px',
                      height: '20px',
                      flex: 1, // Ensures the input takes equal space
                    }}
                  />
                </div>
                
                )}
                <Button
                  onClick={isRegisteringState ? handleRegister : handleLogin}
                  color="primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '18px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    background: '#44a0dc',
                    color: 'white',
                  }}
                >
                  {isRegisteringState ? 'Sign up' : 'Log in'}
                </Button>
              </form>
            )}
            {!isForgotPassword && (
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  margin: '0',
                }}
              >
                {isRegisteringState
                  ? 'Already have an account?'
                  : 'Don’t have an account?'}
                <Button
                  onClick={handleToggleForm}
                  color="primary"
                  style={{
                    textDecoration: 'underline',
                    fontSize: '14px',
                    padding: '0',
                  }}
                >
                  {isRegisteringState ? 'Log in' : 'Sign up'}
                </Button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginBox;

