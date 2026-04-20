import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { supabase } from '../../utils/authClient';

export default function TradeDialog({ open, onClose, mode, targetUser, fixedRequestedCard, onSubmit }) {
  const [myCards, setMyCards] = useState([]);
  const [theirCards, setTheirCards] = useState([]);
  const [mySearch, setMySearch] = useState('');
  const [theirSearch, setTheirSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !targetUser) return;
    setSelectedOffer(null);
    setSelectedRequest(fixedRequestedCard || null);
    setMySearch('');
    setTheirSearch('');
    setError('');
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetUser?.id]);

  const loadCards = async () => {
    setLoading(true);
    // In counter mode we only need the current user's cards
    const myResult = await supabase.collection.getAll();
    const theirResult = mode === 'counter'
      ? { data: [], error: null }
      : await supabase.users.getCollection(targetUser.id);
    setLoading(false);
    if (myResult.error) { setError(myResult.error.message); return; }
    if (theirResult.error) { setError(theirResult.error.message); return; }
    setMyCards(myResult.data);
    setTheirCards(theirResult.data);
  };

  const filteredMy = myCards.filter((p) =>
    !mySearch ||
    p.player_name?.toLowerCase().includes(mySearch.toLowerCase()) ||
    p.team?.toLowerCase().includes(mySearch.toLowerCase())
  );

  const filteredTheir = theirCards.filter((p) =>
    !theirSearch ||
    p.player_name?.toLowerCase().includes(theirSearch.toLowerCase()) ||
    p.team?.toLowerCase().includes(theirSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedOffer || !selectedRequest) return;
    onSubmit(selectedOffer.sofifa_id, selectedRequest.sofifa_id);
  };

  const isPropose = mode === 'propose';
  const isCounter = mode === 'counter';
  const title = isPropose
    ? `Propose Trade with ${targetUser?.username}`
    : `Counter Offer to ${targetUser?.username}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SwapHorizIcon />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" gap={2} sx={{ height: 460 }}>
            {/* My Cards */}
            <Box flex={1} display="flex" flexDirection="column">
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Your Cards ({myCards.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search by name or team..."
                value={mySearch}
                onChange={(e) => setMySearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              {selectedOffer && (
                <Chip
                  label={`Offering: ${selectedOffer.player_name}`}
                  color="primary"
                  onDelete={() => setSelectedOffer(null)}
                  sx={{ mb: 1, maxWidth: '100%' }}
                />
              )}
              <Box
                sx={{
                  overflowY: 'auto',
                  flex: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <List dense disablePadding>
                  {filteredMy.map((card) => (
                    <ListItemButton
                      key={card.sofifa_id}
                      selected={selectedOffer?.sofifa_id === card.sofifa_id}
                      onClick={() => setSelectedOffer(card)}
                    >
                      <ListItemText
                        primary={card.player_name}
                        secondary={`${card.team} · ${card.position}${card.sticker_number ? ` · #${card.sticker_number}` : ''}`}
                      />
                    </ListItemButton>
                  ))}
                  {filteredMy.length === 0 && (
                    <ListItem>
                      <ListItemText secondary={myCards.length === 0 ? 'Your collection is empty.' : 'No cards match.'} />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Their Cards / Fixed requested card */}
            <Box flex={1} display="flex" flexDirection="column">
              {isCounter ? (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    You will receive
                  </Typography>
                  <Box
                    sx={{
                      border: '2px solid',
                      borderColor: 'secondary.main',
                      borderRadius: 2,
                      p: 2,
                      mt: 1,
                      bgcolor: 'secondary.50',
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {fixedRequestedCard?.player_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fixedRequestedCard?.team} &middot; {fixedRequestedCard?.position}
                      {fixedRequestedCard?.sticker_number ? ` · #${fixedRequestedCard.sticker_number}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      This is what {targetUser?.username} originally offered. It stays fixed.
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    {targetUser?.username}&apos;s Cards ({theirCards.length})
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Search by name or team..."
                    value={theirSearch}
                    onChange={(e) => setTheirSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />
                  {selectedRequest && (
                    <Chip
                      label={`Requesting: ${selectedRequest.player_name}`}
                      color="secondary"
                      onDelete={() => setSelectedRequest(null)}
                      sx={{ mb: 1, maxWidth: '100%' }}
                    />
                  )}
                  <Box
                    sx={{
                      overflowY: 'auto',
                      flex: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <List dense disablePadding>
                      {filteredTheir.map((card) => (
                        <ListItemButton
                          key={card.sofifa_id}
                          selected={selectedRequest?.sofifa_id === card.sofifa_id}
                          onClick={() => setSelectedRequest(card)}
                        >
                          <ListItemText
                            primary={card.player_name}
                            secondary={`${card.team} · ${card.position}${card.sticker_number ? ` · #${card.sticker_number}` : ''}`}
                          />
                        </ListItemButton>
                      ))}
                      {filteredTheir.length === 0 && (
                        <ListItem>
                          <ListItemText secondary={theirCards.length === 0 ? 'This user has no cards.' : 'No cards match.'} />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {selectedOffer && selectedRequest && (
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, px: 1 }}>
            Offering <strong>{selectedOffer.player_name}</strong> for <strong>{selectedRequest.player_name}</strong>
          </Typography>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedOffer || !selectedRequest || loading}
          startIcon={<SwapHorizIcon />}
        >
          {isPropose ? 'Send Trade' : 'Send Counter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
