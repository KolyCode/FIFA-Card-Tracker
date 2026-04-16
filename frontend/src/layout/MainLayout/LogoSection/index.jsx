import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { DASHBOARD_PATH } from 'config';
import Logo from 'ui-component/Logo';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
      <Logo />
      <Box sx={{ ml: 1.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', display: { xs: 'none', md: 'block' } }}>
          FIFA Card Tracker
        </Typography>
      </Box>
    </Link>
  );
}
