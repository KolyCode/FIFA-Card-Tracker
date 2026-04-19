import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, useTheme } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PlayerCard = ({ player, isOwned = false, onActionClick }) => {
    const theme = useTheme();

    if (!player) return null;

    const handleActionClick = (e) => {
        e.stopPropagation();
        if (onActionClick) {
            onActionClick(player);
        }
    };

    return (
        <Card
            sx={{
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                background: theme.palette.background.paper,
                boxShadow: theme.customShadows?.z1 || theme.shadows[2],
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.customShadows?.z8 || theme.shadows[8]
                }
            }}
        >
            {/* Action IconButton in the top right corner */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    zIndex: 1, 
                    bgcolor: 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '50%',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <IconButton size="small" onClick={handleActionClick} color={isOwned ? "success" : "default"}>
                    {isOwned ? <CheckCircleIcon color="success" /> : <AddCircleOutlineIcon />}
                </IconButton>
            </Box>
            
            <CardMedia
                component="img"
                height="200"
                image={`https://raw.githubusercontent.com/corgi0/FIFA-Card-Tracker-Test/refs/heads/main/player_images/${player.sofifa_id}.png`}
                alt={player.player_name || player.name}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                }}
                sx={{
                    objectFit: 'cover'
                }}
            />
            <CardContent sx={{ p: 2 }}>
                <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                    {player.player_name || player.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {player.team || player.country} • {player.position}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" color="secondary.main" fontWeight="600">
                        {player.birth_year ? `Born: ${player.birth_year}` : player.marketValue}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PlayerCard;
