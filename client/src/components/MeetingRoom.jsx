import React, { useState, useContext, useEffect } from 'react';
import { Button, TextField, Typography, Container, Paper } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Assignment, Phone } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { SocketContext } from '../Context.js';
import Header from './Header.js';
import { useAuth } from '../AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  container: {
    width: '400px',
    height: '300px',
    margin: '150px auto',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  margin: {
    marginTop: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    border: '2px solid black',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  heading: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    marginBottom: '-20px',
  },
  button: {
    fontSize: '14px', // Increase the button text size
  },
  hosticon: {
    fontSize: '14px',
  },
  textField: {
    marginTop: '2px',
    '& .MuiInputBase-input': {
      fontSize: '14px', // Increase the text field input font size
    },
  },
  inputLabel: {
    fontSize: '16px', // Increase the text field label font size
  },
}));

const Sidebar = ({ children }) => {
  const { me, roomCall } = useContext(SocketContext); // Ensure user is fetched from context
  const [idToCall, setIdToCall] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation(); // Use useLocation to access route state

  useEffect(() => {
    // Check if there's a roomID in the location state
    if (location.state && location.state.roomID) {
      setIdToCall(location.state.roomID);
    }
  }, [location.state]);

  const handleHostMeeting = () => {
    const roomID = me; // Use the socket ID as the room ID
    navigate(`/meeting/room/${roomID}`); // Navigate to the new room
  };

  const handleJoinMeetingClick = () => {
    // setShowJoinForm(true);
    navigator.clipboard.readText()  // Read the copied URL from the clipboard
      .then((copiedUrl) => {
        roomCall(copiedUrl);  // Send the copied URL to roomCall
        navigate(`/meeting/room/${copiedUrl}`);  // Navigate to the room with the given ID
      })
      .catch((error) => {
        console.error('Failed to read clipboard: ', error);  // Handle error if reading fails
      });
  };

  //NOT IN USE 
  const handleJoinMeeting = () => {
    roomCall(idToCall); // Start the room call
    navigate(`/meeting/room/${idToCall}`); // Navigate to the room with the given ID
  };

  const ai = () => {
    navigate('/ai_guidance');
  }

  return (
    <>
      <Header />
      <Container className={classes.container}>
        <Paper elevation={10} className={classes.paper}>
          <Typography variant="h3" className={classes.heading}>Meeting Room</Typography>
          {!showJoinForm ? (
            <div className={classes.root}>
              {/* Check if user exists and then check their role */}
              {user && user.isCounsellor ? (
                <>
                  <CopyToClipboard text={me} className={`${classes.margin} ${classes.hosticon}`}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Assignment className={classes.icon} />}
                      onClick={handleHostMeeting}
                      className={`${classes.margin} ${classes.button}`}
                    >
                      Host a Meeting
                    </Button>
                  </CopyToClipboard>
                </>
              ) : (
                <>
                  {/* Non-counsellors only see Join a Meeting option */}
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<Phone className={classes.icon} />}
                    onClick={handleJoinMeetingClick}
                    className={`${classes.margin} ${classes.button}`}
                  >
                    Join a Meeting
                  </Button>
                  {/* AI Suggestions button for all users */}
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={ai}
                    className={`${classes.margin} ${classes.button}`}
                  >
                    AI Suggestions
                  </Button>
                </>
              )}
            </div>
          ) : (
            <form className={classes.root} noValidate autoComplete="off">
              <TextField
                label="Please Enter Invite URL"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                fullWidth
                className={classes.textField}
                InputLabelProps={{
                  className: classes.inputLabel,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Phone className={classes.icon} />}
                onClick={handleJoinMeeting}
                className={`${classes.margin} ${classes.button}`}
              >
                Join a Meeting
              </Button>
            </form>
          )}
        </Paper>
        {children}
      </Container>
    </>
  );
};

export default Sidebar;
