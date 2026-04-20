import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  DialogContentText,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MailIcon from '@mui/icons-material/Mail';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../../utils/authClient';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        loadGroups();
        loadInvites();
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        if (session) {
          loadGroups();
          loadInvites();
        } else {
          setGroups([]);
          setInvites([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadGroups = async () => {
    const { data, error } = await supabase.groups.getAll();
    if (error) {
      setError(error.message);
    } else {
      setGroups(data);
    }
  };

  const loadInvites = async () => {
    const { data, error } = await supabase.groups.getInvites();
    if (!error) {
      setInvites(data);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Group name is required.');
      return;
    }

    const { data, error } = await supabase.groups.create(newGroupName.trim(), newGroupDescription.trim());
    if (error) {
      setError(error.message);
    } else {
      setGroups([...groups, data]);
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setSuccess('Group created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    const { error } = await supabase.groups.leave(groupId);
    if (error) {
      setError(error.message);
    } else {
      setGroups(groups.filter(g => g.id !== groupId));
      setSuccess('Left group successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberUsername.trim() || !selectedGroup) {
      setError('Username is required.');
      return;
    }

    const { error } = await supabase.groups.inviteMember(selectedGroup.id, newMemberUsername.trim());
    if (error) {
      setError(error.message);
    } else {
      setInviteMemberDialogOpen(false);
      setNewMemberUsername('');
      setSelectedGroup(null);
      setSuccess('Invite sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAcceptInvite = async (invite) => {
    const { error } = await supabase.groups.respondToInvite(invite.id, 'accept');
    if (error) {
      setError(error.message);
    } else {
      setInvites(invites.filter(i => i.id !== invite.id));
      loadGroups();
      setSuccess(`Joined ${invite.group_name}!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeclineInvite = async (invite) => {
    const { error } = await supabase.groups.respondToInvite(invite.id, 'decline');
    if (error) {
      setError(error.message);
    } else {
      setInvites(invites.filter(i => i.id !== invite.id));
      setSuccess('Invite declined.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleRemoveMember = async (groupId, userId, username) => {
    const { error } = await supabase.groups.removeMember(groupId, userId);
    if (error) {
      setError(error.message);
    } else {
      loadGroups();
      setSuccess(`${username} removed from group!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handlePromoteAdmin = async (groupId, userId, username) => {
    const { error } = await supabase.groups.promoteAdmin(groupId, userId);
    if (error) {
      setError(error.message);
    } else {
      loadGroups();
      setSuccess(`${username} promoted to admin!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDemoteAdmin = async (groupId, userId, username) => {
    const { error } = await supabase.groups.demoteAdmin(groupId, userId);
    if (error) {
      setError(error.message);
    } else {
      loadGroups();
      setSuccess(`${username} demoted to member!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Please log in to view and manage your groups.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Groups
        </Typography>
        <Fab
          color="primary"
          aria-label="add group"
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
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

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <MailIcon color="primary" />
            <Typography variant="h6">Pending Invites</Typography>
            <Chip label={invites.length} size="small" color="primary" />
          </Box>
          {invites.map((invite) => (
            <Card key={invite.id} sx={{ mb: 1.5, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body1">
                      Invited to join <strong>{invite.group_name}</strong> by <strong>{invite.invited_by}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleAcceptInvite(invite)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => handleDeclineInvite(invite)}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {groups.length === 0 ? (
        <Box textAlign="center" py={8}>
          <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No groups yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first group or join an existing one!
          </Typography>
        </Box>
      ) : (
        <Box>
          {groups.map((group) => (
            <Accordion
              key={group.id}
              expanded={expandedGroups.has(group.id)}
              onChange={() => toggleGroupExpansion(group.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <GroupIcon />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6">{group.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.description || 'No description'}
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={`${group.member_count} members`}
                        size="small"
                        variant="outlined"
                      />
                      {group.is_admin && (
                        <Chip
                          label="Admin"
                          size="small"
                          color="primary"
                          icon={<AdminPanelSettingsIcon />}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box>
                    {group.is_admin && (
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                          setInviteMemberDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Invite Member
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group.id);
                      }}
                    >
                      Leave Group
                    </Button>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>
                  Members:
                </Typography>
                <List>
                  {(group.members || []).map((member) => (
                    <ListItem key={member.id}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography>{member.username}</Typography>
                            {member.is_admin && (
                              <Chip
                                label="Admin"
                                size="small"
                                color="primary"
                                icon={<AdminPanelSettingsIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={`Joined: ${new Date(member.joined_at).toLocaleDateString()}`}
                      />
                      {group.is_admin && member.id !== parseInt(localStorage.getItem('auth_user')?.id || '0') && (
                        <ListItemSecondaryAction>
                          {member.is_admin ? (
                            <IconButton
                              edge="end"
                              onClick={() => handleDemoteAdmin(group.id, member.id, member.username)}
                              title="Demote to member"
                            >
                              <AdminPanelSettingsIcon color="primary" />
                            </IconButton>
                          ) : (
                            <IconButton
                              edge="end"
                              onClick={() => handlePromoteAdmin(group.id, member.id, member.username)}
                              title="Promote to admin"
                            >
                              <AdminPanelSettingsIcon />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveMember(group.id, member.id, member.username)}
                            title="Remove from group"
                            sx={{ ml: 1 }}
                          >
                            <PersonRemoveIcon color="error" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberDialogOpen} onClose={() => setInviteMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Member to {selectedGroup?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email/username of the person you want to invite to this group.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteMemberDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteMember} variant="contained">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupsPage;