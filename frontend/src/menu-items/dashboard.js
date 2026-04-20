// assets
import { IconUser, IconUsersGroup, IconBook, IconHome, IconHelp, IconShield } from '@tabler/icons-react';

// constant
const icons = { IconUser, IconUsersGroup, IconBook, IconHome, IconHelp, IconShield };

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
      icon: icons.IconUser,
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
      id: 'groups',
      title: 'Groups',
      type: 'item',
      url: '/groups',
      icon: icons.IconUsersGroup,
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
    },
    {
      id: 'moderator-dashboard',
      title: 'Moderator Dashboard',
      type: 'item',
      url: '/moderator-dashboard',
      icon: icons.IconShield,
      breadcrumbs: false,
      requiresModerator: true
    }
  ]
};

export default dashboard;
