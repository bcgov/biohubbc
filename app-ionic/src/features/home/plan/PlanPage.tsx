import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import ActivityDataFilter from 'components/activities-search-controls/ActivitiesFilter';
import ManageDatabaseComponent from 'components/database/ManageDatabaseComponent';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import MapContainer from 'components/map/MapContainer';
import PointOfInterestDataFilter from 'components/point-of-interest-search/PointOfInterestFilter';
import TripDataControls from 'components/trip/TripDataControls';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';
import { MapContextMenuData } from '../map/MapPageControls';

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  map: {
    height: '500px',
    width: '100%'
  },
  layerPicker: {
    height: '100%',
    width: '100%'
  },
  activityRecordList: {
    flexDirection: 'column'
  },
  pointOfInterestList: {
    flexDirection: 'column'
  },
  activityRecordQueryParmsRow: {
    width: '400px'
  },
  //TODO:  make colour of bar depend on how much is used (red = full/bad)
  tripStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  totalStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  tripGrid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);

  const [tripLoaded, setTripLoaded] = useState(false);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */

  const getTrip = async () => {
    let docs = await databaseContext.database.find({ selector: { _id: 'trip' } });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    let tripDoc = docs.docs[0];

    if (tripDoc.geometry) {
      setGeometry(tripDoc.geometry);
    }

    if (tripDoc.extent) {
      setExtent(tripDoc.extent);
    }
  };

  // initial fetch
  useEffect(() => {
    const initialLoad = async () => {
      await getTrip();
      setTripLoaded(true);
    };

    initialLoad();
  }, [databaseContext]);

  // persist geometry changes
  useEffect(() => {
    if (!tripLoaded) {
      return;
    }

    databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, geometry: geometry };
    });
  }, [geometry, tripLoaded]);

  // persist extent changes
  useEffect(() => {
    if (!tripLoaded) {
      return;
    }

    databaseContext.database.upsert('trip', (tripDoc) => {
      return { ...tripDoc, extent: extent };
    });
  }, [extent, tripLoaded]);

  return (
    <Container className={props.classes.container}>
      <Grid container spacing={3} className={classes.tripGrid}>
        <Grid container item xs={12} justify="space-between">
          <TripDataControls />
          <ManageDatabaseComponent />
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h5">Storage Used By This Trip:</Typography>
            <LinearProgress className={classes.tripStorageUsageBar} value={50} variant={'determinate'} />
            <Typography variant="h5">Total Storage Used:</Typography>
            <LinearProgress className={classes.totalStorageUsageBar} value={70} variant={'determinate'} />
          </Paper>
        </Grid>
        <Grid item md={6}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-layer-picker-content"
              id="panel-layer-picker-header">
              <Typography variant="h5">Pick Layers</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.layerPicker}></AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-activiity-record-picker-content"
              id="panel-activity-record-picker-header">
              <Typography variant="h5">Pick Activity Records</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.activityRecordList}>
              <ActivityDataFilter />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel-pointOfInterest-record-picker-content"
              id="panel-pointOfInterest-record-picker-header">
              <Typography variant="h5">Points Of Interest</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.pointOfInterestList}>
              <PointOfInterestDataFilter />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-kml-content" id="panel-kml-header">
              <Typography variant="h5">Load KML</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <KMLUpload />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item md={6}>
          <Paper className={classes.paper}>
            <MapContainer
              {...props}
              classes={classes}
              mapId={'TODO_this_needs_to_be_a_globally_uniqe_id_per_map_instance'}
              geometryState={{ geometry, setGeometry }}
              extentState={{ extent, setExtent }}
              contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlanPage;
