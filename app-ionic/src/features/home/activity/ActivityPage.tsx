import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapPageControls';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { debounced } from 'utils/FunctionUtils';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%'
  },
  photoContainer: {}
}));

interface IActivityPageProps {
  classes?: any;
}

//why does this page think I need a map context menu ?
const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */

  const [doc, setDoc] = useState(null);

  const [photos, setPhotos] = useState<IPhoto[]>([]);

  /**
   * Save the geometry added by the user
   *
   * @param {Feature} geoJSON The geometry in GeoJSON format
   */
  const saveGeometry = async (geometry: Feature[]) => {
    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, geometry: geometry, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  };

  /**
   * Save the map Extent within the database
   *
   * @param {*} extent The leaflet bounds object
   */
  const saveExtent = async (newExtent: any) => {
    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, extent: newExtent };
    });
  };

  /**
   * Save the photos.
   *
   * @param {IPhoto} photos An array of photo objects.
   */
  const savePhotos = async (photos: IPhoto[]) => {
    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, photos: photos, dateUpdated: new Date() };
    });
  };

  /**
   * Save the form when it is submitted.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = async (event: any) => {
    await databaseContext.database.upsert(doc._id, (activity) => {
      return {
        ...activity,
        formData: event.formData,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.VALID
      };
    });
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `500` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(500, async (event: any) => {
      await databaseContext.database.upsert(doc._id, (activity) => {
        return {
          ...activity,
          formData: event.formData,
          status: ActivityStatus.EDITED,
          dateUpdated: new Date(),
          formStatus: FormValidationStatus.NOT_VALIDATED
        };
      });
    }),
    [doc]
  );

  useEffect(() => {
    const getActivityData = async () => {
      const appStateResults = await databaseContext.database.find({ selector: { _id: DocType.APPSTATE } });

      if (!appStateResults || !appStateResults.docs || !appStateResults.docs.length) {
        return;
      }

      const activityResults = await databaseContext.database.find({
        selector: { _id: appStateResults.docs[0].activeActivity }
      });

      setGeometry(activityResults.docs[0].geometry);
      setExtent(activityResults.docs[0].extent);
      setPhotos(activityResults.docs[0].photos || []);
      setDoc(activityResults.docs[0]);
    };

    getActivityData();
  }, [databaseContext]);

  useEffect(() => {
    if (!doc) {
      return;
    }

    saveGeometry(geometry);
  }, [geometry]);

  useEffect(() => {
    if (!doc) {
      return;
    }

    saveExtent(extent);
  }, [extent]);

  useEffect(() => {
    if (!doc) {
      return;
    }

    savePhotos(photos);
  }, [photos]);

  if (!doc) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <ActivityComponent
        classes={classes}
        activity={doc}
        onFormChange={onFormChange}
        onFormSubmitSuccess={onFormSubmitSuccess}
        photoState={{ photos, setPhotos }}
        mapId={doc._id}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
      />
    </Container>
  );
};

export default ActivityPage;
