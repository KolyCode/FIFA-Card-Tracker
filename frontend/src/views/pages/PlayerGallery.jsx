import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';
import PlayerCard from '../../ui-component/cards/PlayerCard';
import { supabase } from '../../utils/authClient';

const PlayerGallery = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [players, setPlayers] = useState([]);
    const [ownedIds, setOwnedIds] = useState(new Set());
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const loadCollection = useCallback(async () => {
        const { data } = await supabase.collection.getAll();
        setOwnedIds(new Set(data.map((p) => String(p.sofifa_id))));
    }, []);

    useEffect(() => {
        // Load all players from the database
        supabase.players.getAll().then(({ data }) => {
            if (data) setPlayers(data);
        });

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                loadCollection();
            }
        };
        init();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setIsLoggedIn(true);
                loadCollection();
            } else {
                setIsLoggedIn(false);
                setOwnedIds(new Set());
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, [loadCollection]);

    const handleActionClick = async (player) => {
        if (!isLoggedIn) return;
        const id = String(player.sofifa_id);
        if (ownedIds.has(id)) {
            await supabase.collection.remove(player.sofifa_id);
            setOwnedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        } else {
            await supabase.collection.add(player.sofifa_id);
            setOwnedIds((prev) => new Set(prev).add(id));
        }
    };

    const filteredPlayers = players.filter((player) =>
        (player.player_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (player.team?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

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
                    Showing {filteredPlayers.length} of {players.length} players
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.sofifa_id}>
                        <PlayerCard
                            player={player}
                            isOwned={ownedIds.has(String(player.sofifa_id))}
                            onActionClick={isLoggedIn ? handleActionClick : undefined}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PlayerGallery;
