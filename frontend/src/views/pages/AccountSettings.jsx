// Developed by Connor Kilroy (UFID: 93903422)
import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// @connor-contribution: Main form logic handling update password with Django backend and dynamic UI form state tracking
const AccountSettings = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    current_password: passwords.currentPassword,
                    new_password: passwords.newPassword
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to change password');
            }
            
            setMessage("Password changed successfully.");
            setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            console.error("Error changing password", error);
            setMessage("Failed to change password. Please check your current password.");
        }
    };

    return (
        <MainCard title="Account Security">
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            name="confirmNewPassword"
                            value={passwords.confirmNewPassword}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </Grid>
                </Grid>
                {message && (
                    <Typography color="primary" sx={{ mt: 2 }}>{message}</Typography>
                )}
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSave}
                    sx={{ mt: 3 }}
                >
                    Save Changes
                </Button>
            </Box>
        </MainCard>
    );
};

export default AccountSettings;