import { Tab, Tabs } from '@material-ui/core';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const TabsComponent: React.FC = () => {
  const history = useHistory();

  const getActiveTab = useCallback(
    (activeTabNumber: number): number => {
      const urlContainsPath = (path: string): string | null => {
        return (history.location.pathname.includes(path) && history.location.pathname) || null;
      };

      switch (history.location.pathname) {
        case urlContainsPath('/home'):
          return 0;
        case urlContainsPath('/projects'):
          return 1;
        default:
          return activeTabNumber;
      }
    },
    [history.location.pathname]
  );

  const [activeTab, setActiveTab] = React.useState(getActiveTab(0));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setActiveTab((activeTabNumber) => getActiveTab(activeTabNumber));
  }, [history.location.pathname, getActiveTab]);

  return (
    <Tabs value={activeTab} onChange={handleChange}>
      {/* <Tab label="Home" onClick={() => history.push('/home')} /> */}
      <Tab label="Projects" onClick={() => history.push('/projects')} />
    </Tabs>
  );
};

export default TabsComponent;
