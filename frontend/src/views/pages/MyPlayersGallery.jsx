import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Grid, Alert, Fab, Paper, Button, LinearProgress, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import PlayerCard from '../../ui-component/cards/PlayerCard';
import { supabase } from '../../utils/authClient';

const MyPlayersGallery = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
            const [{ data: allPlayers }, { data: collection }] = await Promise.all([
                supabase.players.getAll(),
                user ? supabase.collection.getAll() : Promise.resolve({ data: [] }),
            ]);
            if (allPlayers) setTotalPlayers(allPlayers.length);
            if (user) setPlayers(collection ?? []);
            setLoading(false);
        };

        checkSession();

        // Optional: listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setIsLoggedIn(!!session);
                if (session) {
                    const { data } = await supabase.collection.getAll();
                    setPlayers(data);
                } else {
                    setPlayers([]);
                }
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

    if (loading) return null;

    if (!isLoggedIn) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
                    <LockIcon color="action" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Member's Only Sticker Book
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
                {totalPlayers > 0 && (
                    <Box sx={{ width: { xs: '100%', sm: '400px', md: '500px' }, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Collection progress</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {players.length} / {totalPlayers} ({Math.round(players.length / totalPlayers * 100)}%)
                            </Typography>
                        </Box>
                        <Tooltip title={`${players.length} of ${totalPlayers} stickers collected`}>
                            <LinearProgress
                                variant="determinate"
                                value={(players.length / totalPlayers) * 100}
                                sx={{ height: 10, borderRadius: 5 }}
                            />
                        </Tooltip>
                    </Box>
                )}
            </Box>

            {players.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2, justifyContent: 'center' }}>
                    Your sticker book is empty! Add players from the main gallery.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredPlayers.map((player) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={player.sofifa_id}>
                            <PlayerCard player={player} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyPlayersGallery;
