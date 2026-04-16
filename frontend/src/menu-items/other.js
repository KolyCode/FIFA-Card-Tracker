// assets
import { IconHelp } from '@tabler/icons-react';

// constant
const icons = { IconHelp };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'sample-docs-roadmap',
  type: 'group',
  children: [
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

export default other;
