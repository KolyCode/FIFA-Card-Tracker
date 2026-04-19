import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Grid, Alert, CircularProgress } from '@mui/material';
import PlayerCard from '../../ui-component/cards/PlayerCard';
import playersData from '../../data/playersData.json';
import { supabase } from '../../utils/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Deduplicate the players data based on sofifa_id to prevent React key prop rendering issues
const uniquePlayersMap = new Map();
playersData.forEach((player) => {
    if (player.sofifa_id && !uniquePlayersMap.has(player.sofifa_id)) {
        uniquePlayersMap.set(player.sofifa_id, player);
    }
});
const uniquePlayersData = Array.from(uniquePlayersMap.values());

const PlayerGallery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [ownedIds, setOwnedIds] = useState(new Set());
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState('');

    const filteredPlayers = useMemo(() => (
        uniquePlayersData.filter((player) =>
            (player.player_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (player.team?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
    ), [searchQuery]);

    const loadOwnedCards = async () => {
        const response = await fetch(`${API_BASE}/cards/`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Unable to load your saved players.');
        }

        const data = await response.json();
        setOwnedIds(new Set(data.map((item) => String(item.card.sofifa_id))));
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/pages/login', { state: { from: location.pathname } });
                return;
            }

            setIsLoggedIn(true);

            try {
                await loadOwnedCards();
            } catch (error) {
                setActionError(error.message || 'Unable to load your collection.');
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!session?.user) {
                setIsLoggedIn(false);
                navigate('/pages/login', { state: { from: location.pathname } });
                return;
            }

            setIsLoggedIn(true);
            loadOwnedCards().catch((error) => {
                setActionError(error.message || 'Unable to load your collection.');
            });
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [location.pathname, navigate]);

    const handleAddPlayer = async (player) => {
        setActionError('');

        try {
            const response = await fetch(`${API_BASE}/cards/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.cookie
                        .split('; ')
                        .find((row) => row.startsWith('csrftoken='))
                        ?.split('=')[1] || ''
                },
                body: JSON.stringify({
                    sticker_code: String(player.sofifa_id),
                    player_name: player.player_name,
                    team: player.team || '',
                    position: player.position || '',
                    sofifa_id: player.sofifa_id,
                    quantity: 1,
                    is_for_trade: false,
                    notes: ''
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.detail || 'Unable to add player.');
            }

            setOwnedIds((prev) => new Set([...prev, String(player.sofifa_id)]));
        } catch (error) {
            setActionError(error.message || 'Unable to add player.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isLoggedIn) {
        return null;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <TextField
                    variant="outlined"
                    placeholder="Search players by name or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '400px', md: '500px' }, mb: 2 }}
                />
                <Typography variant="subtitle1" color="text.secondary">
                    Showing {filteredPlayers.length} of {uniquePlayersData.length} players
                </Typography>
            </Box>

            {actionError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {actionError}
                </Alert>
            )}

            <Grid container spacing={3}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.sofifa_id}>
                        <PlayerCard
                            player={player}
                            isOwned={ownedIds.has(String(player.sofifa_id))}
                            onActionClick={handleAddPlayer}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PlayerGallery;
