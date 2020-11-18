import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography
} from '@material-ui/core';
import { Add, DeleteForever, Sync } from '@material-ui/icons';
import clsx from 'clsx';
import {
  ActivityStatus,
  ActivitySubtype,
  ActivitySyncStatus,
  ActivityType,
  ActivityTypeIcon,
  FormValidationStatus
} from 'constants/activities';
import { DocType } from 'constants/database';
import { MediumDateFormat } from 'constants/misc';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useBiohubApi } from 'hooks/useBiohubApi';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import 'styles/spinners.scss';
import { notifyError, notifySuccess, notifyWarning } from 'utils/NotificationUtils';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme: Theme) => ({
  activitiesContent: {},
  activityList: {},
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  syncFailed: {
    color: theme.palette.error.main
  },
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
  },
  actionsBar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: '2rem'
  }
}));

interface IActivityListItem {
  isDisabled?: boolean;
  activity: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const toggleActivitySyncReadyStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Must save the value because the database call is async, and the event object will be destroyed before it runs.
    const isChecked = event.target.checked;

    databaseContext.database.upsert(props.activity._id, (activity) => {
      return { ...activity, sync: { ...activity.sync, ready: isChecked } };
    });
  };

  const isDisabled = props.isDisabled || props.activity.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {props.activity.activitySubtype.split('_')[2]}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography variant="h6" className={classes.activitiyListItem_Typography}>
          Form Status
        </Typography>
        {props.activity.formStatus}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Sync Status</Typography>
        {props.activity.sync.status}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Created</Typography>
        {moment(props.activity.dateCreated).format(MediumDateFormat)}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Last Updated</Typography>
        {(props.activity.dateUpdated && moment(props.activity.dateUpdated).format(MediumDateFormat)) || 'n/a'}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={1}>
        <Typography className={classes.activitiyListItem_Typography}>Reviewed</Typography>
        <Checkbox
          disabled={isDisabled}
          checked={props.activity.sync.ready}
          onChange={(event) => toggleActivitySyncReadyStatus(event)}
          onClick={(event) => event.stopPropagation()}
        />
      </Grid>
    </Grid>
  );
};

interface IActivityList {
  classes?: any;
  isDisabled?: boolean;
  activityType: ActivityType;
}

// TODO change any to a type that defines the overall items being displayed
const ActivityList: React.FC<IActivityList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.ACTIVITY, activityType: props.activityType }
    });

    setDocs([...activityResult.docs]);
  };

  useEffect(() => {
    const updateComponent = () => {
      updateActivityList();
    };

    updateComponent();
  }, [databaseChangesContext]);

  const removeActivity = async (activity: PouchDB.Core.RemoveDocument) => {
    databaseContext.database.remove(activity);
  };

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

  return (
    <List className={classes.activityList}>
      {docs.map((doc) => {
        const isDisabled = props.isDisabled || doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

        return (
          <Paper key={doc._id}>
            <ListItem
              button
              // disabled={isDisabled}
              className={classes.activitiyListItem}
              onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
              <ListItemIcon>
                <SvgIcon
                  fontSize="large"
                  className={clsx(
                    (doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL && classes.syncSuccessful) ||
                      (doc.sync.status === ActivitySyncStatus.SYNC_FAILED && classes.syncFailed)
                  )}
                  component={ActivityTypeIcon[props.activityType]}
                />
              </ListItemIcon>
              <ActivityListItem isDisabled={props.isDisabled} activity={doc} />
              <ListItemSecondaryAction>
                <IconButton disabled={isDisabled} onClick={() => removeActivity(doc)}>
                  <DeleteForever />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        );
      })}
    </List>
  );
};

const ActivitiesList: React.FC = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const biohubApi = useBiohubApi();

  const [syncing, setSyncing] = useState(false);
  const [isDisabled, setIsDisable] = useState(false);

  const syncActivities = async () => {
    setIsDisable(true);
    setSyncing(true);

    // fetch all activity documents that are ready to sync
    const activityResult = await databaseContext.database.find({
      selector: {
        docType: DocType.ACTIVITY,
        formStatus: FormValidationStatus.VALID,
        'sync.ready': true,
        'sync.status': { $ne: ActivitySyncStatus.SYNC_SUCCESSFUL }
      }
    });

    // sync each activity one-by-one
    for (const activity of activityResult.docs) {
      try {
        await biohubApi.createActivity({
          activity_id: activity.activityId,
          created_timestamp: activity.dateCreated,
          activity_type: activity.activityType,
          activity_subtype: activity.activitySubtype,
          geometry: activity.geometry,
          media: activity.photos.map((photo) => {
            return { file_name: photo.filepath, encoded_file: photo.dataUrl };
          }),
          form_data: activity.formData
        });

        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_SUCCESSFUL, error: null }
          };
        });
      } catch (error) {
        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_FAILED, error: error.message }
          };
        });
      }
    }

    setSyncing(false);
    setIsDisable(false);
  };

  const addNewActivity = async (activityType: ActivityType, activitySubtype: ActivitySubtype) => {
    const id = uuidv4();

    await databaseContext.database.put({
      _id: id,
      activityId: id,
      docType: DocType.ACTIVITY,
      activityType: activityType,
      activitySubtype: activitySubtype,
      status: ActivityStatus.NEW,
      sync: {
        ready: false,
        status: ActivitySyncStatus.NOT_SYNCED,
        error: null
      },
      dateCreated: new Date(),
      dateUpated: null,
      formData: null,
      formStatus: FormValidationStatus.NOT_VALIDATED
    });
  };

  return (
    <>
      <div>
        <div className={classes.actionsBar}>
          <Button
            disabled={isDisabled}
            variant="contained"
            color="primary"
            startIcon={<Sync className={clsx(syncing && 'rotating')} />}
            onClick={() => syncActivities()}>
            Sync Activities
          </Button>
        </div>
        <div className={classes.activitiesContent}>
          <div>
            <div>
              <Typography variant="h5">Observations</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Observation, ActivitySubtype.Observation_PlantTerrestial)}>
                Plant Terrestrial
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Observation, ActivitySubtype.Observation_PlantAquatic)}>
                Plant Aquatic
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Observation, ActivitySubtype.Observation_AnimalTerrestrial)}>
                Animal Terrestrial
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Observation, ActivitySubtype.Observation_AnimalAquatic)}>
                Animal Aquatic
              </Button>

              <ActivityList isDisabled={isDisabled} activityType={ActivityType.Observation} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Treatments</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_ChemicalPlant)}>
                Plant Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_MechanicalPlant)}>
                Plant Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_BiologicalPlant)}>
                Plant Biological
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_BiologicalDispersalPlant)
                }>
                Plant Biological Dispersal
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_MechanicalTerrestrialAnimal)
                }>
                Animal Terrestrial Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_ChemicalTerrestrialAnimal)
                }>
                Animal Terrestrial Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Treatment, ActivitySubtype.Treatment_BiologicalTerrestrialAnimal)
                }>
                Animal Terrestrial Biological
              </Button>

              <ActivityList isDisabled={isDisabled} activityType={ActivityType.Treatment} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Monitorings</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant)
                }>
                Plant Terrestrial/Aquatic Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant)
                }>
                Plant Terrestrial/Aquatic Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_BiologicalTerrestrialPlant)
                }>
                Plant Terrestrial Biological
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_MechanicalTerrestrialAnimal)
                }>
                Animal Terrestrial Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_ChemicalTerrestrialAnimal)
                }>
                Animal Terrestrial Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityType.Monitoring, ActivitySubtype.Monitoring_BiologicalTerrestrialAnimal)
                }>
                Animal Terrestrial Biological
              </Button>

              <ActivityList isDisabled={isDisabled} activityType={ActivityType.Monitoring} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Development/Testing</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => notifyError(databaseContext, 'An error message!')}>
                Simulate Error
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => notifySuccess(databaseContext, 'A Success message!')}>
                Simulate Success
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => notifyWarning(databaseContext, 'A Warning message!')}>
                Simulate Warning
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivitiesList;
