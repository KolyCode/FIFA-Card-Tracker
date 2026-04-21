// Developed by Connor Kilroy (UFID: 93903422)
import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// player gallery routing
const LandingPage = Loadable(lazy(() => import('views/pages/LandingPage')));
const PlayerGallery = Loadable(lazy(() => import('views/pages/PlayerGallery')));
const MyPlayersGallery = Loadable(lazy(() => import('views/pages/MyPlayersGallery')));
const GroupsPage = Loadable(lazy(() => import('views/pages/GroupsPage')));
const ModeratorDashboard = Loadable(lazy(() => import('views/pages/ModeratorDashboard')));
const AccountSettings = Loadable(lazy(() => import('views/pages/AccountSettings')));

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: '/home',
      element: <LandingPage />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <PlayerGallery />
        }
      ]
    },
    {
      path: 'my-players',
      element: <MyPlayersGallery />
    },
    {
      path: 'groups',
      element: <GroupsPage />
    },
    {
      path: 'moderator-dashboard',
      element: <ModeratorDashboard />
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: 'account-settings',
      element: <AccountSettings />
    }
  ]
};

export default MainRoutes;
