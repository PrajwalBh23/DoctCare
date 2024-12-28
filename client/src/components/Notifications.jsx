import React, { useContext } from 'react';
import { Button, Paper, Typography, makeStyles } from '@material-ui/core';
import { SocketContext } from '../Context.js';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    border: '2px solid black',
    borderRadius: '5px',
  },
  message: {
    marginRight: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const Notifications = () => {
  const { call, callAccepted, handleJoinResponse, answerCall } = useContext(SocketContext);
  const classes = useStyles();

  const handleAnswerCall = () => {
    if (call.signal) {
      answerCall();
    }
  };

  const handleRejectCall = () => {
    handleJoinResponse(call.from, call.signal, false);
  };
  
  return (
    <>
      {call.isReceivingCall && !callAccepted && (
        <Paper className={classes.container}>
          <Typography variant="h6" className={classes.message}>{call.name} is calling:</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnswerCall}
            className={classes.button}
          >
            Answer
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleRejectCall}
            className={classes.button}
          >
            Reject
          </Button>
        </Paper>
      )}
    </>
  );
};

export default Notifications;