import { Collapse, IconButton, makeStyles, Snackbar, Theme, withWidth } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
import TabsContainer from 'components/tabs/TabsContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import MarkunreadMailboxIcon from '@material-ui/icons/MarkunreadMailbox';
import Badge from '@material-ui/core/Badge';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';

const useStyles = makeStyles((theme: Theme) => ({
  homeLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  tabsContainer: {
    flexGrow: 1,
    width: '100%'
  },
  homeContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

const HomeLayout = (props: any) => {
  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const updateComponent = () => {
      addNotificationsToPage();
    };

    updateComponent();
  }, [databaseChangesContext]);

  const addNotificationsToPage = async () => {
    await databaseContext.database.createIndex({
      index: {
        name: 'notifyIndex',
        fields: ['dateCreated', '_id', 'docType', 'notificationType', 'text', 'acknowledged']
      }
    });

    const notifyIndex = await (await databaseContext.database.getIndexes()).indexes.find(
      (e) => e.name === 'notifyIndex'
    );

    const notifications = await databaseContext.database.find({
      selector: {
        dateCreated: { $gte: null },
        _id: { $gte: null },
        docType: DocType.NOTIFICATION,
        notificationType: { $gte: null },
        text: { $gte: null },
        acknowledged: false
      },

      fields: ['dateCreated', '_id', 'docType', 'notificationType', 'text', 'acknowledged'],
      sort: [{ dateCreated: 'desc' }], //    <--   can't find or use index
      use_index: notifyIndex.ddoc
    });

    setNotificationCount(notifications.docs.length);

    if (notifications.docs.length > 0) {
      setNotification(notifications.docs[0]);
      setIsOpen(true);
    }
  };

  const acknowledgeNotification = (docId: string) => {
    databaseContext.database.upsert(docId, (doc) => {
      return { ...doc, acknowledged: true };
    });

    setIsOpen(false);
  };

  return (
    <div className={classes.homeLayoutRoot}>
      <TabsContainer classes={classes.tabsContainer} />
      <Collapse timeout={50} in={isOpen}>
        <Alert
          // severity can't be null so this is a workaround
          severity={notification == null ? 'success' : notification.notificationType}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="medium"
              onClick={() => {
                acknowledgeNotification(notification._id);
              }}>
              <Badge badgeContent={notificationCount}>
                <MarkunreadMailboxIcon></MarkunreadMailboxIcon>
              </Badge>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }>
          <strong>{notification == null ? null : notification.text}</strong>
        </Alert>
      </Collapse>
      <div className={classes.homeContainer}>{props.children}</div>
    </div>
  );
};

export default HomeLayout;
