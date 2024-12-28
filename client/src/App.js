import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/MeetingRoom';
import Videocall from './components/videocall';
import Home from './components/Home';
import Profile from './components/profile';
import BookDoctor from './components/BookDoctor';
import AI from './components/AI_Guidance';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meeting" element={<Sidebar />} />
        <Route path="/meeting/room/:roomID" element={<Videocall />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book" element={<BookDoctor/>} />
        <Route path="/ai_guidance" element={<AI />} />
      </Routes>
    </>
  );
}

export default App;