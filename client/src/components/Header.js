import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from './images/health.jpg';
import './Styles/Header.css';
import LoginDialog from './Loginbox';
import { useAuth } from '../AuthContext';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { AccountCircle, Notifications } from '@material-ui/icons';
import axios from 'axios'; // Import axios for API calls
import { API } from '../AuthContext';
import { SocketContext } from '../Context.js';

const Header = () => {
  const { user, logout, profile, counsellor } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation(); 
  const { state } = location;
  const tokenFromUrl = state ? state.token : null; 
  const { notifications } = useContext(SocketContext);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    setOpen(true);
  };

  const handleButtonClose = () => {
    setOpen(false);
  };

  const handleLoginClick = () => {
    setIsRegistering(false);
    setLoginDialogOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegistering(true);
    setLoginDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const accept = () => {
    navigate('/meeting');
  }

  const decline = async () => {
    const token = tokenFromUrl || localStorage.getItem('token');

    try {
      // Make sure the API endpoint is correct and accessible
      const res = await axios.post(`${API}/routes/notification`, {}, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in request header
        },
      });
      alert(`You have declined the booking successfully!`);
      window.location.reload();
    } catch (error) {
      alert(`An error occurred while declining the booking: ${error.message}`);
    }
  };


  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Room URL is copied successfully');
        navigate("/meeting");
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
      });
  };

  const notificationsCount = notifications.length; // Update notifications count

  return (
    <header className="header" data-header>
      <div className="container">
        <Link to="/" className="logo">
          <img src={logo} style={{ borderRadius: '25%' }} width="45" height="40" alt="Cryptex logo" />
          DoctCare
        </Link>
        <div className="btn-group">
          {!user ? (
            <>
              <button className="btn btn-outline" onClick={handleLoginClick}>Log in</button>
              <button className="btn btn-outline" onClick={handleRegisterClick}>Sign up</button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button style={{ backgroundColor: 'transparent' }} onClick={handleButtonClick}>
                  <Badge
                    badgeContent={notificationsCount}
                    color="secondary"
                    showZero={false} 
                    sx={{
                      '& .MuiBadge-badge': {
                        color: 'white',
                        fontSize: '16px',
                      },
                    }}
                  >
                    <Notifications style={{ color: 'white', fontSize: '30px' }} />
                  </Badge>
                </Button>
                <Dialog open={open} onClose={handleButtonClose}>
                  <DialogContent>
                    <h2 style={{ fontSize: '2.5rem' }}>Notifications</h2> 
                    {loading ? (
                      <p style={{ fontSize: '1.4rem' }}>Loading...</p>
                    ) : notifications.length > 0 ? (
                      <ul style={{ padding: 0 }}>
                        {notifications.map((notification, index) => (
                          <li key={index} onClick={() => notification.roomUrl && copyToClipboard(notification.roomUrl)}
                            style={{
                              fontSize: '1.4rem',
                              padding: '3px',
                              marginBottom: '10px',
                              border: '1px solid hsl(0, 0%, 85%)',
                              borderRadius: '5px',
                            }}
                          >
                            {notification.message}
                            {user.isCounsellor && (
                              <div style={{ marginTop: '10px' }}>
                                <button
                                  style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'hsl(221.91deg 100% 60.98%)', color: 'white', borderRadius: '8px' }}
                                  onClick={() => accept()}
                                >
                                  Join
                                </button>
                                <button
                                  style={{ padding: '5px 10px', backgroundColor: 'hsl(352.7deg 77.59% 67.68%)', color: 'white', borderRadius: '8px' }}
                                  onClick={() => decline()}
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.9rem' }}>No scheduled meetings today.</p>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  style={{ backgroundColor: 'transparent', marginRight: '16px' }}
                  onClick={profile}
                >
                  <AccountCircle style={{ fontSize: '38px' }} />
                </Button>
              </div>
              <button className="btn btn-special btn-outline" onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>
      </div>
      <LoginDialog
        open={loginDialogOpen}
        handleClose={() => setLoginDialogOpen(false)}
        isRegistering={isRegistering}
      />
    </header>
  );
};

export default Header;
