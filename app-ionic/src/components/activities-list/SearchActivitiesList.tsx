import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography
} from '@material-ui/core';
import { ActivityTypeIcon } from 'constants/activities';
import { MediumDateFormat } from 'constants/misc';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: '6px'
  },
  activityListItem_Grid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  activitiyListItem_Typography: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline',
      marginRight: '1rem'
    }
  }
}));

interface ISearchActivityListItem {
  activity: any;
}

const SearchActivityListItem: React.FC<ISearchActivityListItem> = (props) => {
  const classes = useStyles();

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={1}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity._id}>
          <Typography className={classes.activitiyListItem_Typography}>ID</Typography>
          {props.activity._id}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={3}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activityType}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {props.activity.activityType}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={3}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Subtype</Typography>
          {props.activity.activitySubtype.split('_')[2]}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={3}>
        <Typography className={classes.activitiyListItem_Typography}>Date</Typography>
        {moment(props.activity.dateReceived).format(MediumDateFormat)}
      </Grid>
    </Grid>
  );
};

interface ISearchActivitiesList {
  activities: any[];
}

const SearchActivitiesList: React.FC<ISearchActivitiesList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const navigateToSearchActivityPage = async (doc: any) => {
    history.push(`/home/search/activity/${doc._id}`);
  };

  return (
    <List>
      {props.activities.map((activity) => {
        return (
          <Paper key={activity._id}>
            <ListItem
              button
              className={classes.activitiyListItem}
              onClick={() => navigateToSearchActivityPage(activity)}>
              <ListItemIcon>
                <SvgIcon fontSize="large" component={ActivityTypeIcon[activity.activityType]} />
              </ListItemIcon>
              <SearchActivityListItem activity={activity} />
            </ListItem>
          </Paper>
        );
      })}
    </List>
  );
};

export default SearchActivitiesList;
