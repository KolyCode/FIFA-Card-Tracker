// assets
import { IconUsers, IconBook, IconHome, IconHelp } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconBook, IconHome, IconHelp };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'home',
      title: 'Home',
      type: 'item',
      url: '/home',
      icon: icons.IconHome,
      breadcrumbs: false
    },
    {
      id: 'player-gallery',
      title: 'Player Gallery',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'my-players',
      title: 'My Players',
      type: 'item',
      url: '/my-players',
      icon: icons.IconBook,
      breadcrumbs: false
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: 'https://github.com/KolyCode/FIFA-Card-Tracker',
      icon: icons.IconHelp,
      external: true,
      target: true
    }
  ]
};

export default dashboard;
