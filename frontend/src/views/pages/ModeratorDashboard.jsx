import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';

import { modAuth, modApi } from 'utils/modAuthClient';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Groups state
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [addMemberGroupId, setAddMemberGroupId] = useState(null);
  const [addMemberUsername, setAddMemberUsername] = useState('');
  const [deleteGroupTarget, setDeleteGroupTarget] = useState(null);

  // Players state
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPage, setPlayerPage] = useState(0);
  const [playerRowsPerPage, setPlayerRowsPerPage] = useState(25);
  const [deletePlayerTarget, setDeletePlayerTarget] = useState(null);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ id: '', sticker_number: '', player_name: '', team: '', position: '', birth_year: '' });

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(25);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  // Shared state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const modUser = modAuth.getUser();

  useEffect(() => {
    if (!modAuth.isLoggedIn()) {
      navigate('/pages/mod-login');
      return;
    }
    loadGroups();
  }, []);

  useEffect(() => {
    if (tab === 1 && players.length === 0) {
      loadPlayers();
    }
    if (tab === 2 && users.length === 0) {
      loadUsers();
    }
  }, [tab]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    const { data, error } = await modApi.getAllUsers();
    setUsersLoading(false);
    if (error) setError(error.message);
    else setUsers(data);
  };

  const loadGroups = async () => {
    setGroupsLoading(true);
    const { data, error } = await modApi.getAllGroups();
    setGroupsLoading(false);
    if (error) setError(error.message);
    else setGroups(data);
  };

  const loadPlayers = async () => {
    setPlayersLoading(true);
    const { data, error } = await modApi.getAllPlayers();
    setPlayersLoading(false);
    if (error) setError(error.message);
    else setPlayers(data);
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupTarget) return;
    const { error } = await modApi.deleteGroup(deleteGroupTarget.id);
    setDeleteGroupTarget(null);
    if (error) setError(error.message);
    else {
      setGroups(groups.filter((g) => g.id !== deleteGroupTarget.id));
      showSuccess(`Group "${deleteGroupTarget.name}" deleted.`);
    }
  };

  const handleAddMember = async (groupId) => {
    if (!addMemberUsername.trim()) return;
    const { error } = await modApi.addMember(groupId, addMemberUsername.trim());
    if (error) {
      setError(error.message);
    } else {
      setAddMemberGroupId(null);
      setAddMemberUsername('');
      loadGroups();
      showSuccess('Member added.');
    }
  };

  const handleRemoveMember = async (groupId, userId, username) => {
    const { error } = await modApi.removeMember(groupId, userId);
    if (error) setError(error.message);
    else {
      loadGroups();
      showSuccess(`${username} removed from group.`);
    }
  };

  const handleDeletePlayer = async () => {
    if (!deletePlayerTarget) return;
    const { error } = await modApi.deletePlayer(deletePlayerTarget.id);
    setDeletePlayerTarget(null);
    if (error) {
      setError(error.message);
    } else {
      setPlayers(players.filter((p) => p.id !== deletePlayerTarget.id));
      showSuccess(`"${deletePlayerTarget.player_name}" removed from all galleries.`);
    }
  };

  const handleAddPlayer = async () => {
    const { data, error } = await modApi.addPlayer({
      ...newPlayer,
      id: parseInt(newPlayer.id),
      birth_year: newPlayer.birth_year ? parseInt(newPlayer.birth_year) : null,
    });
    if (error) {
      setError(error.message);
    } else {
      setAddPlayerOpen(false);
      setNewPlayer({ id: '', sticker_number: '', player_name: '', team: '', position: '', birth_year: '' });
      setPlayers([...players, data]);
      showSuccess(`Player "${data.player_name}" added.`);
    }
  };

  const handleToggleTradeBan = async (user) => {
    const { error } = await modApi.setTradeBan(user.id, !user.trade_banned);
    if (error) {
      setError(error.message);
    } else {
      setUsers(users.map((u) => u.id === user.id ? { ...u, trade_banned: !u.trade_banned } : u));
      showSuccess(`${user.username} ${!user.trade_banned ? 'banned from trading' : 'allowed to trade'}.`);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    const { error } = await modApi.deleteUser(deleteUserTarget.id);
    setDeleteUserTarget(null);
    if (error) {
      setError(error.message);
    } else {
      setUsers(users.filter((u) => u.id !== deleteUserTarget.id));
      showSuccess(`User "${deleteUserTarget.username}" deleted.`);
    }
  };

  const handleLogout = () => {
    modAuth.logout();
    navigate('/pages/mod-login');
  };

  const filteredPlayers = players.filter((p) => {
    const q = playerSearch.toLowerCase();
    return (
      !q ||
      p.player_name?.toLowerCase().includes(q) ||
      p.team?.toLowerCase().includes(q) ||
      p.sticker_number?.toLowerCase().includes(q) ||
      p.position?.toLowerCase().includes(q)
    );
  });

  const pagedPlayers = filteredPlayers.slice(
    playerPage * playerRowsPerPage,
    playerPage * playerRowsPerPage + playerRowsPerPage
  );

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const pagedUsers = filteredUsers.slice(
    userPage * userRowsPerPage,
    userPage * userRowsPerPage + userRowsPerPage
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <ShieldIcon sx={{ color: 'warning.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4">Moderator Dashboard</Typography>
            <Typography variant="caption" color="text.secondary">
              Logged in as <strong>{modUser?.username}</strong>
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab icon={<GroupIcon />} iconPosition="start" label={`Groups (${groups.length})`} />
        <Tab icon={<PersonIcon />} iconPosition="start" label={`Players (${players.length})`} />
        <Tab icon={<PeopleIcon />} iconPosition="start" label={`Users (${users.length})`} />
      </Tabs>

      {/* ===== GROUPS TAB ===== */}
      <TabPanel value={tab} index={0}>
        {groupsLoading ? (
          <Typography color="text.secondary">Loading groups...</Typography>
        ) : groups.length === 0 ? (
          <Typography color="text.secondary">No groups exist yet.</Typography>
        ) : (
          groups.map((group) => (
            <Accordion
              key={group.id}
              expanded={expandedGroups.has(group.id)}
              onChange={() => {
                const next = new Set(expandedGroups);
                next.has(group.id) ? next.delete(group.id) : next.add(group.id);
                setExpandedGroups(next);
              }}
              sx={{ mb: 1.5 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <GroupIcon />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6">{group.name}</Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      <Chip label={`${group.member_count} members`} size="small" variant="outlined" />
                      <Chip label={`Created by ${group.created_by}`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteGroupTarget(group);
                    }}
                  >
                    Delete Group
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Add member inline form */}
                {addMemberGroupId === group.id ? (
                  <Box display="flex" gap={1} mb={2} alignItems="center">
                    <TextField
                      size="small"
                      label="Username to add"
                      value={addMemberUsername}
                      onChange={(e) => setAddMemberUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember(group.id)}
                      autoFocus
                    />
                    <Button variant="contained" size="small" onClick={() => handleAddMember(group.id)}>
                      Add
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setAddMemberGroupId(null);
                        setAddMemberUsername('');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddMemberGroupId(group.id)}
                    sx={{ mb: 1 }}
                  >
                    Add Member
                  </Button>
                )}

                <Typography variant="subtitle2" gutterBottom>
                  Members:
                </Typography>
                {group.members.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No members.
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {group.members.map((member) => (
                      <ListItem key={member.id} disableGutters>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">{member.username}</Typography>
                              {member.is_admin && <Chip label="Admin" size="small" color="primary" />}
                            </Box>
                          }
                          secondary={member.email}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            color="error"
                            title="Remove member"
                            onClick={() => handleRemoveMember(group.id, member.id, member.username)}
                          >
                            <PersonRemoveIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </TabPanel>

      {/* ===== PLAYERS TAB ===== */}
      <TabPanel value={tab} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Search players..."
            value={playerSearch}
            onChange={(e) => {
              setPlayerSearch(e.target.value);
              setPlayerPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 280 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPlayerOpen(true)}>
            Add Player
          </Button>
        </Box>

        {playersLoading ? (
          <Typography color="text.secondary">Loading players...</Typography>
        ) : (
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sticker #</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Birth Year</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedPlayers.map((player) => (
                    <TableRow key={player.id} hover>
                      <TableCell>{player.sticker_number || '—'}</TableCell>
                      <TableCell>{player.player_name}</TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.birth_year || '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete player"
                          onClick={() => setDeletePlayerTarget(player)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pagedPlayers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={2}>
                          No players found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={filteredPlayers.length}
              rowsPerPage={playerRowsPerPage}
              page={playerPage}
              onPageChange={(_, p) => setPlayerPage(p)}
              onRowsPerPageChange={(e) => {
                setPlayerRowsPerPage(parseInt(e.target.value, 10));
                setPlayerPage(0);
              }}
            />
          </Paper>
        )}
      </TabPanel>

      {/* Confirm Delete Group Dialog */}
      <Dialog open={!!deleteGroupTarget} onClose={() => setDeleteGroupTarget(null)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteGroupTarget?.name}</strong>? This cannot be undone and will remove all memberships.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteGroup}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Player Dialog */}
      <Dialog open={!!deletePlayerTarget} onClose={() => setDeletePlayerTarget(null)}>
        <DialogTitle>Delete Player</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletePlayerTarget?.player_name}</strong> (sticker #{deletePlayerTarget?.sticker_number})? This will remove them from all user galleries and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletePlayerTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeletePlayer}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== USERS TAB ===== */}
      <TabPanel value={tab} index={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setUserPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 280 }}
          />
        </Box>

        {usersLoading ? (
          <Typography color="text.secondary">Loading users...</Typography>
        ) : (
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Date Joined</TableCell>
                    <TableCell>Trade Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.trade_banned ? (
                          <Chip label="Trade Banned" color="error" size="small" icon={<BlockIcon />} />
                        ) : (
                          <Chip label="Can Trade" color="success" size="small" icon={<CheckCircleIcon />} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color={user.trade_banned ? 'success' : 'warning'}
                          title={user.trade_banned ? 'Lift trade ban' : 'Ban from trading'}
                          onClick={() => handleToggleTradeBan(user)}
                          sx={{ mr: 0.5 }}
                        >
                          {user.trade_banned ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete account"
                          onClick={() => setDeleteUserTarget(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pagedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" py={2}>
                          No users found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={userRowsPerPage}
              page={userPage}
              onPageChange={(_, p) => setUserPage(p)}
              onRowsPerPageChange={(e) => {
                setUserRowsPerPage(parseInt(e.target.value, 10));
                setUserPage(0);
              }}
            />
          </Paper>
        )}
      </TabPanel>

      {/* Confirm Delete User Dialog */}
      <Dialog open={!!deleteUserTarget} onClose={() => setDeleteUserTarget(null)}>
        <DialogTitle>Delete User Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the account for <strong>{deleteUserTarget?.username}</strong>? This will remove their collection, group memberships, and all trade history. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteUser}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={addPlayerOpen} onClose={() => setAddPlayerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Player</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="SoFIFA ID *"
              type="number"
              value={newPlayer.id}
              onChange={(e) => setNewPlayer({ ...newPlayer, id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Sticker Number"
              value={newPlayer.sticker_number}
              onChange={(e) => setNewPlayer({ ...newPlayer, sticker_number: e.target.value })}
              fullWidth
            />
            <TextField
              label="Player Name"
              value={newPlayer.player_name}
              onChange={(e) => setNewPlayer({ ...newPlayer, player_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Team"
              value={newPlayer.team}
              onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}
              fullWidth
            />
            <TextField
              label="Position"
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
              fullWidth
            />
            <TextField
              label="Birth Year"
              type="number"
              value={newPlayer.birth_year}
              onChange={(e) => setNewPlayer({ ...newPlayer, birth_year: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddPlayerOpen(false);
              setNewPlayer({ id: '', sticker_number: '', player_name: '', team: '', position: '', birth_year: '' });
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddPlayer} disabled={!newPlayer.id}>
            Add Player
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
