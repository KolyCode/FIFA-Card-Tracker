// Developed by Connor Kilroy (UFID: 93903422)
// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={colorScheme === ThemeMode.DARK ? logoDark : logo} alt="Berry" width="100" />
     *
     */
    <img 
      src="https://raw.githubusercontent.com/corgi0/FIFA-Card-Tracker-Test/98c0b799fefe9190e300cc503b8a6e077ad2454b/FIFA_logo_without_slogan.svg" 
      alt="FIFA Logo" 
      width="120px" 
    />
  );
}
