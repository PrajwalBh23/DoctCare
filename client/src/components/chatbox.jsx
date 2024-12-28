import React, { useState, useEffect, useRef } from 'react';
import { TextField, List, ListItem, ListItemText, IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import { SocketContext } from '../Context';

const Chatbox = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { socket } = React.useContext(SocketContext);
  const chatEndRef = useRef(null);

  const handleMessageSend = () => {
    if (message.trim()) {
      socket.emit('messagesend', message);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('createMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('createMessage');
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List style={{ flexGrow: 1, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText primary={msg} />
          </ListItem>
        ))}
        <div ref={chatEndRef} />
      </List>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleMessageSend()}
          placeholder="Type your message..."
        />
        <IconButton onClick={handleMessageSend}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Chatbox;
