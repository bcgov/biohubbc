import { AppBar, Tab, Tabs } from '@material-ui/core';
import { Assignment, Bookmarks, Explore, HomeWork, Map, Search } from '@material-ui/icons';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function a11yProps(index: any) {
  return {
    id: `home-tab-${index}`,
    'aria-controls': `home-tabpanel-${index}`
  };
}

interface IBaseProps {
  classes?: any;
}

const TabsContainer: React.FC<IBaseProps> = (props) => {
  const history = useHistory();

  const urlContainsPath = (path: string): string => {
    return (history.location.pathname.includes(path) && history.location.pathname) || null;
  };

  const getActiveTab = useCallback(
    (activeTab: number): number => {
      switch (history.location.pathname) {
        case urlContainsPath('/home/search'):
          return 0;
        case urlContainsPath('/home/plan'):
          return 1;
        case urlContainsPath('/home/references'):
        case urlContainsPath('/home/references/activity/'):
          return 2;
        case urlContainsPath('/home/activities'):
          return 3;
        case urlContainsPath('/home/map'):
          return 4;
        case urlContainsPath('/home/activity'):
          return 5;
        default:
          return activeTab;
      }
    },
    [history.location.pathname]
  );

  const [activeTab, setActiveTab] = React.useState(getActiveTab(0));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setActiveTab((activeTab) => getActiveTab(activeTab));
  }, [history.location.pathname, getActiveTab]);

  return (
    <div className={props.classes.tabBar}>
      <AppBar position="static">
        <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="on">
          <Tab label="Search" icon={<Search />} onClick={() => history.push('/home/search')} {...a11yProps(1)} />
          <Tab label="Plan My Trip" icon={<Explore />} onClick={() => history.push('/home/plan')} {...a11yProps(1)} />
          <Tab
            label="References"
            icon={<Bookmarks />}
            onClick={() => history.push('/home/references')}
            {...a11yProps(2)}
          />
          <Tab
            label="My Activities"
            icon={<HomeWork />}
            onClick={() => history.push('/home/activities')}
            {...a11yProps(3)}
          />
          <Tab label="Map" icon={<Map />} onClick={() => history.push('/home/map')} {...a11yProps(4)} />
          <Tab
            label="Current Activity"
            icon={<Assignment />}
            onClick={() => history.push('/home/activity')}
            {...a11yProps(5)}
          />
        </Tabs>
      </AppBar>
    </div>
  );
};

export default TabsContainer;
