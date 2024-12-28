import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useLocation } from 'react-router-dom';
import { API } from './AuthContext';
import { useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode'; // Fixed import

const SocketContext = createContext();

const socket = io(`${API}`);

const ContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [name, setName] = useState('');
  const [me, setMe] = useState('');
  const [participants, setParticipants] = useState([]);
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (location.pathname.startsWith('/meeting') || location.pathname.startsWith('/meeting/room/')) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
        })
        .catch(err => console.error('Error accessing media devices:', err));
    } else {
      stopDevices();
    }

    socket.on('me', (id) => {
      setMe(id);
    });

    socket.on('roomCall', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
      setCallAccepted(false);
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      connectionRef.current.signal(signal);
    });

    socket.on("callRejected", () => {
      alert("Your request to join was rejected");
    });

    socket.on("updateParticipants", (participantsList) => {
      setParticipants(participantsList);
    });

    socket.on('newBooking', (data) => {
      console.log("newBooking event received", data);
      // Check if the incoming booking userID matches the logged-in user's ID
      if (user) { // Only proceed if user is defined
        try {
          const decodedToken = jwtDecode(user.token); // Ensure the token is accessible
          console.log("Matched userID:", decodedToken.id);
          if (decodedToken.id === data.userID) {
            alert("New booking: " + data.message);
            setNotifications((prevNotifications) => [
              ...prevNotifications,
              { message: data.message },
            ]);
          } else {
            console.log("UserID does not match:", decodedToken.id, data.userID);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        console.log("User not logged in or no token available");
      }
    });

    socket.on('decline', (data) => {
      console.log("newBooking event received", data);

      // Check if the incoming booking userID matches the logged-in user's ID
      if (user) { // Only proceed if user is defined
        try {
          const decodedToken = jwtDecode(user.token); // Ensure the token is accessible
          console.log("Matched userID:", decodedToken.id);
          if (decodedToken.id === data.userID) {
            alert(data.message);
            setNotifications((prevNotifications) => [
              ...prevNotifications,
              { message: data.message },
            ]);
          } else {
            console.log("UserID does not match:", decodedToken.id, data.userID);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        console.log("User not logged in or no token available");
      }
    });

    socket.on('joining', (data) => {
      if (user) { // Only proceed if user is defined
        try {
          const decodedToken = jwtDecode(user.token); // Ensure the token is accessible
          console.log("Matched userID:", decodedToken.id);
          if (decodedToken.id === data.userID) {
            alert(data.message);

            const notificationMessage = data.Roomurl
              ? `Please join the meeting using Room URL: ${data.Roomurl}`
              : data.message;

            const newNotification = {
              message: notificationMessage,
              roomUrl: data.Roomurl // Store the room URL for copying
            };

            setNotifications((prevNotifications) => [
              ...prevNotifications,
              newNotification // Correctly format the notification object
            ]);

          } else {
            console.log("UserID does not match:", decodedToken.id, data.userID);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        console.log("User not logged in or no token available");
      }
    });

    socket.on('receive-message', (newMessage) => {
      console.log('Message received:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message to state
    });

    socket.on('receive-file', (fileData) => {
      setMessages((prevMessages) => [...prevMessages, { type: 'file', ...fileData }]);
    });

    return () => {
      socket.off('me');
      socket.off('roomCall');
      socket.off('callAccepted');
      socket.off('callRejected');
      socket.off('updateParticipants');
      socket.off('newBooking');
      socket.off('joining');
      socket.off("receive-message");
      socket.off("receive-file");
    };
  }, [location.pathname, user]); // Include user in dependencies to rerun effect when user changes

  const stopDevices = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
  };

  const answerCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
    peer.signal(call.signal);
    setCallAccepted(true);
  };

  const roomCall = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('roomCall', { roomID: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    window.location.reload();
  };

  const handleSendMessage = (message) => {
    const newMessage = { content: message, sender: user.id, type: 'text' };
    console.log("message", newMessage);
    socket.emit("send-message", { me, message: newMessage });
  };

  const handleSendFile = (fileContent, fileName) => {
    const fileData = {
      content: fileContent, // Base64 content
      fileName,
      sender: user.id,
      type: 'file',
    };

    socket.emit('send-file', fileData);
  };
  

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      participants,
      roomCall,
      leaveCall,
      answerCall,
      setCall,
      notifications,
      handleSendMessage,
      handleSendFile,
      messages, 
      setMessages
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
