import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Fixed import

const AuthContext = createContext();

// export const API = "http://localhost:5000";
export const API = "https://doct-care-zj7d.vercel.app";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ token, ...decodedToken });
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
  }, []);

  const register = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setUser({ token, ...decodedToken });
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setUser({ token, ...decodedToken });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const profile = () => {
    if (user && user.isCounsellor) {
      navigate('/profile');
    } else {
      navigate('/meeting');
    }
  };

  const counsellor = () => {
    // Check if the user is a counselor and return JSX
    if (user && user.isCounsellor) {
      return (
        <span>
          {' '}
          <a href="/meeting" style={{ color: 'blue', textDecoration: 'underline' }}>
            Host a Meeting
          </a>
        </span>
      );
    }
    return null; // If not a counselor, return nothing
  };

  const loginOrNot = () => {
    return user;
  };

  return (
    <AuthContext.Provider
      value={{ user, register, loginOrNot, login, logout, profile, counsellor }}
    >
      {children}
    </AuthContext.Provider>
  );
};
