import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Avatar, Typography, CardActions, Button } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // Import Axios for making API calls
import { useAuth } from '../AuthContext';
import { API } from '../AuthContext';
import Header from './Header';
import './Styles/Header.css';

export default function BookDoctor() {
    const location = useLocation(); // Use useLocation to access route state
    const { state } = location;
    const tokenFromUrl = state ? state.token : null; // Access token from route state
    const { user } = useAuth();

    // Set up state for experts
    const [experts, setExperts] = useState([]);

    // Fetch experts function
    const fetchExperts = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/routes/get_Doctors`);
            console.log('Fetched experts:', response.data); // Log the fetched data
            setExperts(response.data); // Correctly update state with fetched experts
        } catch (error) {
            console.error('Error fetching experts:', error); // Log any error
        }
    }, []); // Empty dependency array since we only want this to be defined once

    // useEffect to fetch experts when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchExperts(); // Fetch the experts when the component mounts
    }, [fetchExperts]); // Add fetchExperts as a dependency (to avoid the warning)

    const handleBook = async (expertId) => {
        const userId = user.id; // Assuming you have the user's ID from context or state

        const token = tokenFromUrl || localStorage.getItem('token');
        try {

            // Send the request using axios
            const response = await axios.patch(`${API}/routes/book`, {
                expertId,
                userId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Set token in Authorization header
                    'Content-Type': 'application/json'
                }
            });
            // Check response data
            if (response.data.success) {
                alert(`Successfully booked Doctor.`);
                const bookingSuccessEvent = new CustomEvent('bookingSuccess', {
                    detail: { message: 'Doctor has been successfully booked!' }
                });
                window.dispatchEvent(bookingSuccessEvent); // Dispatch the event globally
                // Optionally update the UI here
            } else {
                alert('Failed to book the Doctor. Please try again.');
            }
        } catch (error) {
            alert('An error occurred while booking the Doctor.');
        }
    };

    return (
        <>
            <Header />
            <div className="expert_container">
                <Typography variant="h3" style={{ marginBottom: "5px" }} className="section_title">
                    Doctors List :-
                </Typography>
                <div className="expert">
                    <Grid container spacing={2}>
                        {experts.map((expert, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card className="expert_card">
                                    <CardContent>
                                        <Grid container alignItems="center">
                                            {/* Left side for the image */}
                                            <Grid item xs={4} sm={3} style={{ display: 'flex', justifyContent: 'center' }}>
                                                <Avatar
                                                    src={expert.myImage}
                                                    alt={expert.name}
                                                    style={{ width: '92px', height: '92px' }}
                                                />
                                            </Grid>

                                            {/* Right side for the text */}
                                            <Grid item xs={8} sm={8} style={{marginLeft:'2px'}}>
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
                                                <Typography variant="body2" style={{ marginBottom: '10px', fontSize: '1.3rem', textAlign:'left' }}>
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
        </>
    );
}
