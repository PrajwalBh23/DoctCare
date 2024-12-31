import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, AppBar, IconButton, Dialog, DialogTitle, DialogContent, Grid, Box, Paper, Button, TextField } from '@material-ui/core';
import { Mic, MicOff, Videocam, VideocamOff, RadioButtonChecked, Group, Chat, LocalHospital, Stop, AttachFile } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import { SocketContext } from '../Context.js';
import male from './images/male_avator.png';
import './Styles/videocall.css';
import axios from 'axios'; // Import Axios for making API calls
import { useAuth } from '../AuthContext';
import { API } from '../AuthContext';
import Draggable from 'react-draggable';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '90vh',
    position: 'relative',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    spacing: '10px',
    width: (props) => (props.chatOpen ? '75%' : '100%'), // Adjusts width based on chatOpen state
    transition: 'width 0.3s ease',
    marginLeft: (props) => (props.chatOpen ? '10px' : 'auto'), // Align to the left when chat is open
    marginRight: (props) => (props.chatOpen ? 'auto' : 'auto'),
  },
  controlsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: '-20px',
    padding: theme.spacing(1),
  },
  leftControls: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
  },
  centerControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  rightControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
  },
  controlButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
    fontSize: '2rem',
    '& .MuiSvgIcon-root': {
      fontSize: '2.8rem'
    },
    '& .MuiTypography-caption': {
      fontSize: '1.5rem'
    }
  },
  leaveButton: {
    backgroundColor: 'red',
    color: 'white',
    width: '100px',
    height: '42px',
    fontSize: '1.5rem',
    '&:hover': {
      backgroundColor: 'red',
      color: 'white',
    },
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: '15px',
    backgroundImage: `url(${male})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  avatar: {
    width: '100%',
    borderRadius: '15px',
    objectFit: 'cover',
  },
  paper: {
    padding: '2px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'black',
    margin: '10px',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'red',
    color: 'white',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
  recordIcon: {
    marginRight: theme.spacing(1),
  },
  chatContainer: {
    width: '350px', // Width of chat area
    height: '90vh',
    backgroundColor: '#f1f1f1',
    border: '1px solid gray',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: '2px',
    top: '2px',
    zIndex: 1000,
    transition: 'transform 0.3s ease-in-out',
  },
  chatHeader: {
    padding: theme.spacing(1),
    borderBottom: '2px solid black',
    backgroundColor: '#ddd',
    textAlign: 'center',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
  },
  chatInputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderTop: '2px solid black',
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    marginRight: "20px",
  },
  chatButton: {
    marginLeft: "-5px",
  },
  invite: {
    backgroundColor: '#307afb',
    color: 'white',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '5px 15px',
    position: 'absolute',
    marginLeft: '94%',
    marginTop: '-2%',
  }
}));

const DraggableDialogTitle = (props) => (
  <Draggable handle=".draggable-title" cancel={'[class*="MuiDialogContent-root"]'}>
    <div {...props} />
  </Draggable>
);

const Videocall = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const classes = useStyles({ chatOpen });
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to access route state
  const { state } = location;
  const tokenFromUrl = state ? state.token : null; // Access token from route state
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  const toggleDialog = () => {
    setOpen(!open);
  };


  const { name, callAccepted, myVideo, userVideo, callEnded, call, stream, setStream, messages, handleSendMessage, handleSendFile } = useContext(SocketContext);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });
  }, [myVideo, setStream]);

  useEffect(() => {
    const fetchUserDetails = async () => {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (token) {
          try {
            const response = await axios.get(`${API}/routes/get_details`, {
              headers: {
                Authorization: `Bearer ${token}`, // Send token in request header
              },
            });

            // Assuming the response contains age and weight
            const { age, weight } = response.data;
            setAge(age);
            setWeight(weight);
          } catch (error) {
            console.error('Error fetching profile data:', error);
          }
        }
    };

    fetchUserDetails();
  }); 


  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [micOn, stream]);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = videoOn;
      });

      if (videoOn && myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    }
  }, [videoOn, stream, myVideo]);

  useEffect(() => {
    if (userVideo.current) {
      const videoTrack = userVideo.current.srcObject?.getVideoTracks()[0];
      if (videoTrack) {
        setRemoteVideoOn(videoTrack.enabled);
      } else {
        setRemoteVideoOn(false);
      }
    }
  }, [userVideo]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVideo = () => {
    setVideoOn(prevVideoOn => !prevVideoOn);
  };

  const handleLeave = () => {
    navigate('/');
  };

  const toggleMic = () => {
    setMicOn(prevMicOn => !prevMicOn);
  };

  const handleStartRecording = () => {
    const options = { mimeType: 'video/webm; codecs=vp9' };
    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.webm';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);

      // Save to local storage
      localStorage.setItem('videoRecording', url);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecording(false);
    }
  };

  const toggleChat = () => {
    setChatOpen(prev => !prev);
  };

  const handleMessageChange = (e) => {
    setMessage('');
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log('Selected file:', selectedFile);

    // Convert file to base64
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the base64 content to the state
        setFileContent(reader.result); // Base64-encoded content
      };
      reader.readAsDataURL(selectedFile);
    }
  };



  const handleInvite = async () => {
    const roomurl = window.location.pathname.split('/').pop();
    const userId = user.id; // Assuming you have the user's ID from context or state
    const token = tokenFromUrl || localStorage.getItem('token');

    try {
      // Send the request using axios
      const response = await axios.get(`${API}/routes/meeting`, {
        params: { // Use params to send query parameters
          roomurl,
          userId,
        },
        headers: {
          Authorization: `Bearer ${token}`, // Correctly set the token in the headers
        }
      });

      // Check response data
      if (response.data.success) {
        alert(response.data.message); // Assuming you want to show a specific message
      } else {
        alert('Failed to send. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the URL.');
    }
  };

  return (
    <>
      <div className="box">
        <Typography style={{ fontSize: "30px", textAlign: 'center', color: 'white', paddingTop: '5px' }}>Meeting Room</Typography>
        <Button onClick={handleInvite} className={classes.invite}>Invite</Button>
        {chatOpen && (
          <div className={classes.chatContainer}>
            <div className={classes.chatHeader}>
              <Typography style={{ color: 'black' }} variant="h6">Chat Area</Typography>
            </div>
            <div style={{ color: 'black' }} className={classes.chatMessages}>
              {messages.map((msg, index) => (
                <div style={{ margin: '20px 0' }} key={index} className={classes.message}>
                  {msg.type === 'text' ? (
                    <Typography style={{ fontSize: '18px' }}>{msg.content}</Typography>  // For text messages
                  ) : msg.type === 'file' ? (
                    <a style={{ color: 'black', border: '2px solid red', borderRadius: '30px', padding: '5px' }} href={msg.content} download={msg.fileName}>
                      {msg.fileName} {/* Display the file name */}
                    </a>
                  ) : null}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>


            <div>
              {file && (
                <div>
                  <p>Selected file: {file.name}</p>
                  {file.type.startsWith('image/') && <img src={URL.createObjectURL(file)} alt="File preview" />}
                </div>
              )}
            </div>

            <div className={classes.chatInputContainer}>
              <IconButton className={classes.chatButton} onClick={() => document.getElementById('fileInput').click()}>
                <AttachFile />
              </IconButton>

              {/* Hidden file input */}
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <TextField
                style={{ fontSize: '20px' }}
                className={classes.chatInput}
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={() => {
                if (message !== '') {
                  handleSendMessage(message);
                } if (fileContent) {
                  handleSendFile(fileContent, file.name);
                }
                handleMessageChange()
              }} variant="contained" color="primary">
                Send
              </Button>
            </div>
          </div>
        )}

        <Dialog
          open={open}
          onClose={toggleDialog}
          PaperComponent={DraggableDialogTitle}
          aria-labelledby="health-view-title"
        >
          <DialogTitle
            id="health-view-title"
            className="draggable-title"
            style={{
              cursor: 'move',
              backgroundColor: '#212121', // Dark background for the title
              color: '#fff', // White text color
              padding: '8px',
              textAlign: 'center',
              fontSize: '2.20rem',
            }}
          >
            Health View
          </DialogTitle>
          <DialogContent style={{ backgroundColor: '#303030', padding: '16px' }}>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper
                  elevation={3}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#424242',
                    color: '#fff',
                    // width: '50%'
                  }}
                >
                  <Typography variant="subtitle1">Temperature</Typography>
                  <Box
                    border={1}
                    padding="8px"
                    borderRadius="5px"
                    style={{
                      backgroundColor: '#000',
                      color: '#00e676',
                    }}
                  >
                    98.6°F
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={3}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#424242',
                    color: '#fff',
                  }}
                >
                  <Typography variant="subtitle1">Heart Rate</Typography>
                  <Box
                    border={1}
                    padding="8px"
                    borderRadius="5px"
                    style={{
                      backgroundColor: '#000',
                      color: '#00e676',
                    }}
                  >
                    72 bpm
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={3}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#424242', // Dark background for Paper
                    color: '#fff', // White text color
                  }}
                >
                  <Typography variant="subtitle1">Oxygen Level</Typography>
                  <Box
                    border={1}
                    padding="8px"
                    borderRadius="5px"
                    style={{
                      backgroundColor: '#000', // Black background
                      color: '#00e676', // Green text for health metrics
                    }}
                  >
                    98%
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={3}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#424242',
                    color: '#fff',
                  }}
                >
                  <Typography variant="subtitle1">Age</Typography>
                  <Box
                    border={1}
                    padding="8px"
                    borderRadius="5px"
                    style={{
                      backgroundColor: '#000',
                      color: '#00e676',
                    }}
                  >
                    {age} Yrs.
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={3}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: '#424242',
                    color: '#fff',
                  }}
                >
                  <Typography variant="subtitle1">Weight</Typography>
                  <Box
                    border={1}
                    padding="8px"
                    borderRadius="5px"
                    style={{
                      backgroundColor: '#000',
                      color: '#00e676',
                    }}
                  >
                    {weight} kg
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

        <div className={classes.wrapper}>
          {recording && (
            <div className={classes.recordingIndicator}>
              <RadioButtonChecked className={classes.recordIcon} />
              <Typography variant="body2">Recording</Typography>
            </div>
          )}
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} md={6}>
              <Paper className={classes.paper}>
                <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
                {videoOn ? (
                  <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
                ) : (
                  <img src={male} alt="User Avatar" className={classes.avatar} />
                )}
              </Paper>
            </Grid>

            {callAccepted && !callEnded && (
              <Grid item xs={12} md={6}>
                <Paper className={classes.paper}>
                  <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
                  {remoteVideoOn ? (
                    <video playsInline ref={userVideo} autoPlay className={classes.video} />
                  ) : (
                    <img src={male} alt="Other User Avatar" className={classes.avatar} />
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
          {children}
          <Grid container className={classes.controlsContainer}>
            <Grid item className={classes.leftControls}>
              <IconButton className={classes.controlButton} onClick={toggleMic} style={{ color: 'white' }}>
                {micOn ? <Mic /> : <MicOff style={{ color: 'red' }} />}
                <Typography variant="caption">{micOn ? 'Mute' : 'Unmute'}</Typography>
              </IconButton>
              <IconButton className={classes.controlButton} onClick={toggleVideo}>
                {videoOn ? <Videocam /> : <VideocamOff style={{ color: 'red' }} />}
                <Typography variant="caption">{videoOn ? 'Stop Video' : 'Start Video'}</Typography>
              </IconButton>
            </Grid>

            <Grid item className={classes.centerControls}>
              <IconButton disabled className={classes.controlButton} onClick={recording ? handleStopRecording : handleStartRecording}>
                {recording ? <Stop /> : <RadioButtonChecked />}
                <Typography variant="caption">{recording ? 'Stop Recording' : 'Record'}</Typography>
              </IconButton>
              <IconButton onClick={toggleDialog} className={classes.controlButton}>
                <LocalHospital />
                <Typography style={{ padding: '2px' }} variant="caption">Patient Health</Typography>
              </IconButton>
              <div className={classes.controlButton}>
                <IconButton onClick={toggleChat} style={{ color: 'white' }} >
                  <Chat /><Typography variant="caption">Chat</Typography>
                </IconButton>
              </div>
              <IconButton disabled className={classes.controlButton}>
                <Group />
                <Typography variant="caption">Participants</Typography>
              </IconButton>
            </Grid>

            <Grid item className={classes.rightControls}>
              <Button variant="contained" className={classes.leaveButton} onClick={handleLeave}>
                Leave
              </Button>
            </Grid>
          </Grid>
          <Notifications />
        </div>
      </div>
    </>
  );
};

export default Videocall;