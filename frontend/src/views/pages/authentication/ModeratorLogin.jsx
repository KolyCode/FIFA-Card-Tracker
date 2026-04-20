import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';

import { modAuth } from 'utils/modAuthClient';

export default function ModeratorLogin() {
  const navigate = useNavigate();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error } = await modAuth.login(username, password);
    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      navigate('/moderator-dashboard');
    }
  };

  return (
    <AuthWrapper1>
      <Stack sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Stack sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
          <Box sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
            <AuthCardWrapper>
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Link to="#" aria-label="logo">
                    <Logo />
                  </Link>
                </Box>
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                    <Typography variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                      Moderator Login
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '14px', textAlign: 'center' }}>
                    Restricted access — moderators only
                  </Typography>
                </Stack>
                <Box sx={{ width: 1 }}>
                  <form noValidate onSubmit={handleSubmit}>
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    <CustomFormControl fullWidth>
                      <InputLabel htmlFor="mod-username">Username</InputLabel>
                      <OutlinedInput
                        id="mod-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Username"
                        required
                      />
                    </CustomFormControl>
                    <CustomFormControl fullWidth>
                      <InputLabel htmlFor="mod-password">Password</InputLabel>
                      <OutlinedInput
                        id="mod-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        required
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </CustomFormControl>
                    <Box sx={{ mt: 2 }}>
                      <AnimateButton>
                        <Button
                          disabled={isSubmitting}
                          color="secondary"
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                        >
                          {isSubmitting ? 'Signing In...' : 'Sign In as Moderator'}
                        </Button>
                      </AnimateButton>
                    </Box>
                  </form>
                </Box>
                <Divider sx={{ width: 1 }} />
                <Stack sx={{ alignItems: 'center' }}>
                  <Typography
                    component={Link}
                    to="/pages/login"
                    variant="subtitle1"
                    sx={{ textDecoration: 'none' }}
                  >
                    Back to regular login
                  </Typography>
                </Stack>
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>
        <Box sx={{ px: 3, my: 3 }}>
          <AuthFooter />
        </Box>
      </Stack>
    </AuthWrapper1>
  );
}
