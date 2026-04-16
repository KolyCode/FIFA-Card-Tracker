// assets
import { IconUsers, IconBook, IconHome } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconBook, IconHome };

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
    }
  ]
};

export default dashboard;
