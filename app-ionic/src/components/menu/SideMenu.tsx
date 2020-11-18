import { List, ListItem, ListItemText, ListItemIcon, SvgIcon } from '@material-ui/core';
import { Assignment, Photo, Map, Lock, SvgIconComponent } from '@material-ui/icons';

import React from 'react';
import { useHistory } from 'react-router-dom';

interface AppPage {
  url: string;
  icon: SvgIconComponent;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Observation',
    url: '/home/observation',
    icon: Assignment
  },
  {
    title: 'Treatment',
    url: '/home/treatment',
    icon: Assignment
  },
  {
    title: 'Monitoring',
    url: '/home/monitoring',
    icon: Assignment
  },
  {
    title: 'Photo Gallery',
    url: '/home/photo',
    icon: Photo
  },
  {
    title: 'Map',
    url: '/home/map',
    icon: Map
  },
  {
    title: 'Admin',
    url: '/home/admin',
    icon: Lock
  }
];

const SideMenu: React.FC = (props) => {
  const history = useHistory();

  return (
    <List>
      {appPages.map((appPage, index) => {
        return (
          <ListItem button key={appPage.title} onClick={() => history.push(appPage.url)}>
            <ListItemIcon>
              <SvgIcon component={appPage.icon} />
            </ListItemIcon>
            <ListItemText>{appPage.title}</ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
};

export default SideMenu;
