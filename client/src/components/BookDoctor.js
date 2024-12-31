import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Avatar, Typography, CardActions, Button } from '@material-ui/core';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { API } from '../AuthContext';
import Header from './Header';
import LoginDialog from './Loginbox';
import './Styles/Header.css';

export default function BookDoctor() {
    const location = useLocation(); // Access route state
    const navigate = useNavigate();
    const { state } = location;
    const tokenFromUrl = state ? state.token : null;
    const { user, loginOrNot, login, register } = useAuth(); // Access auth functions

    const [experts, setExperts] = useState([]); // State for doctors
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status
    const [loginDialogOpen, setLoginDialogOpen] = useState(false); // State for login dialog

    // Fetch experts function
    const fetchExperts = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/routes/get_Doctors`);
            setExperts(response.data);
        } catch (error) {
            console.error('Error fetching experts:', error);
        }
    }, []);

    // useEffect to check login status and fetch experts
    useEffect(() => {
        const checkLoginAndFetch = async () => {
            try {
                const loggedIn = await loginOrNot();
                setIsLoggedIn(loggedIn);

                if (!loggedIn) {
                    setLoginDialogOpen(true);
                    return;
                }

                fetchExperts();
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        };

        checkLoginAndFetch();
    }, [loginOrNot, fetchExperts]);

    // Close the login dialog and navigate if still not logged in
    const handleClose = () => {
        setLoginDialogOpen(false);
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    };

    const handleLogin = async () => {
        try {
            await login();
            const loggedInToken = localStorage.getItem('token');
            navigate(`/book?token=${loggedInToken}`);
        } catch (error) {
            console.error('Login failed:', error);
            navigate('/');
        }
    };

    const handleRegister = async () => {
        try {
            await register();
            const loggedInToken = localStorage.getItem('token');
            navigate(`/book?token=${loggedInToken}`);
        } catch (error) {
            console.error('Registration failed:', error);
            navigate('/');
        }
    };

    const handleBook = async (expertId) => {
        const userId = user?.id;
        const token = tokenFromUrl || localStorage.getItem('token');

        try {
            const response = await axios.patch(`${API}/routes/book`, {
                expertId,
                userId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                alert('Successfully booked Doctor.');
            } else {
                alert('Failed to book the Doctor. Please try again.');
            }
        } catch (error) {
            console.error('Error booking the doctor:', error);
            alert('An error occurred while booking the Doctor.');
        }
    };

    return (
        <>
            <Header />
            <div className="expert_container">
                <Typography variant="h3" style={{ marginBottom: '5px' }} className="section_title">
                    Doctors List :-
                </Typography>
                <div className="expert">
                    <Grid container spacing={2}>
                        {experts.map((expert, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card className="expert_card">
                                    <CardContent>
                                        <Grid container alignItems="center">
                                            <Grid item xs={4} sm={3} style={{ display: 'flex', justifyContent: 'center' }}>
                                                <Avatar
                                                    src={expert.myImage}
                                                    alt={expert.name}
                                                    style={{ width: '92px', height: '92px' }}
                                                />
                                            </Grid>
                                            <Grid item xs={8} sm={8} style={{ marginLeft: '2px' }}>
                                                <Typography variant="h6" style={{ marginBottom: '10px', fontSize: '1.5rem' }}>
                                                    {expert.name}
                                                </Typography>
                                                <div style={{ marginBottom: '10px' }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        style={{ display: 'inline-block', marginRight: '10px', fontSize: '1.4rem' }}
                                                    >
                                                        {expert.phone}
                                                    </Typography>
                                                </div>
                                                <Typography variant="body2" style={{ marginBottom: '10px', fontSize: '1.3rem', textAlign: 'left' }}>
                                                    {expert.education}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleBook(expert._id)}
                                            color="primary"
                                            fullWidth
                                        >
                                            Book
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>
            {!isLoggedIn && (
                <LoginDialog
                    open={loginDialogOpen}
                    handleClose={handleClose}
                    handleLogin={handleLogin}
                    handleRegister={handleRegister}
                />
            )}
        </>
    );
}
