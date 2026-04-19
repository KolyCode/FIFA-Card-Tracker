import React, { useState } from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';
import PlayerCard from '../../ui-component/cards/PlayerCard';
import playersData from '../../data/playersData.json';

// Deduplicate the players data based on sofifa_id to prevent React key prop rendering issues
const uniquePlayersMap = new Map();
playersData.forEach((player) => {
    if (player.sofifa_id && !uniquePlayersMap.has(player.sofifa_id)) {
        uniquePlayersMap.set(player.sofifa_id, player);
    }
});
const uniquePlayersData = Array.from(uniquePlayersMap.values());

const PlayerGallery = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPlayers = uniquePlayersData.filter((player) =>
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
                    Showing {filteredPlayers.length} of {uniquePlayersData.length} players
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.sofifa_id}>
                        <PlayerCard player={player} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PlayerGallery;
