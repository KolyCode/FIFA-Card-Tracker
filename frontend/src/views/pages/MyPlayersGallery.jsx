import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Grid, Alert, Fab, Paper, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import PlayerCard from '../../ui-component/cards/PlayerCard';
import { supabase } from '../../utils/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const MyPlayersGallery = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPlayers = async () => {
        const response = await fetch(`${API_BASE}/cards/`, {
            credentials: 'include'
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
            throw new Error(data.detail || 'Unable to load your players.');
        }

        setPlayers(
            data.map((item) => ({
                ...item.card,
                quantity: item.quantity,
                is_for_trade: item.is_for_trade,
                notes: item.notes,
                owner: item.owner
            }))
        );
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);

            if (user) {
                try {
                    await loadPlayers();
                } catch (loadError) {
                    setError(loadError.message || 'Unable to load your players.');
                }
            }

            setLoading(false);
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const loggedIn = !!session;
                setIsLoggedIn(loggedIn);

                if (loggedIn) {
                    try {
                        await loadPlayers();
                        setError('');
                    } catch (loadError) {
                        setError(loadError.message || 'Unable to load your players.');
                    }
                } else {
                    setPlayers([]);
                }

                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const filteredPlayers = players.filter((player) =>
        (player.player_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (player.team?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isLoggedIn) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
                    <LockIcon color="action" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Member&apos;s Only Sticker Book
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Log in or Sign up to start tracking your personal FIFA sticker collection!
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={() => navigate('/pages/login', { state: { from: '/my-players' } })} 
                    >
                        Take me to Login
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            <Fab 
                color="primary" 
                aria-label="add" 
                sx={{ position: 'absolute', top: 24, right: 24 }}
                onClick={() => navigate('/dashboard/default')}
            >
                <AddIcon />
            </Fab>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <TextField
                    variant="outlined"
                    placeholder="Search my players by name or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '400px', md: '500px' }, mb: 2 }}
                />
                {players.length > 0 && (
                    <Typography variant="subtitle1" color="text.secondary">
                        Showing {filteredPlayers.length} of {players.length} collected players
                    </Typography>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {players.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2, justifyContent: 'center' }}>
                    Your sticker book is empty! Add players from the main gallery.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredPlayers.map((player) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={player.sofifa_id}>
                            <PlayerCard player={player} isOwned />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyPlayersGallery;
