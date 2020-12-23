import { CircularProgress, Container, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { interactiveGeoInputData } from 'components/map/GeoMeta';
import MapContainer from 'components/map/MapContainer';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';
import { MapContextMenu, MapContextMenuData } from './MapPageControls';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%'
  },
  map: {
    height: '100%',
    width: '100%'
  }
}));

interface IMapProps {
  classes?: any;
}

const PointOfInterestPopUp = (name: string) => {
  //return <div> {props.name} </div>;
  return '<div>' + name + '</div>';
};

const MapPage: React.FC<IMapProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState<interactiveGeoInputData[]>(null);

  const [isReadyToLoadMap, setIsReadyToLoadMap] = useState(false);

  const [extent, setExtent] = useState(null);

  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  // don't load the map until interactive geos ready
  useEffect(() => {
    const didInteractiveGeosLoad = interactiveGeometry ? true : false;
    setIsReadyToLoadMap(didInteractiveGeosLoad);
  }, [databaseChangesContext, interactiveGeometry]);

  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };

  const getEverythingWithAGeo = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        docType: {
          $in: [
            DocType.REFERENCE_ACTIVITY,
            DocType.ACTIVITY,
            DocType.REFERENCE_POINT_OF_INTEREST,
            DocType.POINT_OF_INTEREST
          ]
        }
      }
    });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    let geos = [];
    let interactiveGeos = [];

    docs.docs.forEach((row) => {
      if (!row.geometry || !row.geometry.length) {
        return;
      }

      geos.push(row.geometry[0]);

      switch (row.docType) {
        case DocType.POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Point of Interest:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#FF5733',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('clicked geo');
            }, //try to get this one workign first
            popUpComponent: PointOfInterestPopUp
          });
          /* isSelected?: boolean;

          markerComponent?: FunctionComponent;
          showMarkerAtZoom?: number;
          showMarker: boolean;

          */
          /*
          showPopUp: boolean;})*/
          break;
        case DocType.REFERENCE_ACTIVITY:
          break;
        case DocType.ACTIVITY:
          break;
        case DocType.REFERENCE_POINT_OF_INTEREST:
          interactiveGeos.push({
            //mapContext: MapContext.MAIN_MAP,
            recordDocID: row._id,
            recordDocType: row.docType,
            description: 'Point of Interest:\n ' + row._id + '\n' + row.geometry[0].coordinates,

            // basic display:
            geometry: row.geometry[0],
            color: '#FF5733',
            zIndex: 1, // need to ask jamie how to implement this

            // interactive
            onClickCallback: () => {
              //setInteractiveGeometry([interactiveGeos])
              console.log('clicked geo');
            }, //try to get this one workign first
            popUpComponent: PointOfInterestPopUp
          });
          /* isSelected?: boolean;

          markerComponent?: FunctionComponent;
          showMarkerAtZoom?: number;
          showMarker: boolean;

          */
          /*
          showPopUp: boolean;})*/
          break;
        default:
          break;
      }
    });

    setGeometry(geos);

    setInteractiveGeometry(
      interactiveGeos
    ); /*/todo figure out to have this as a dictionary with only the delta
        getting written to on updates*/

    //setIsReadyToLoadMap(true)
  };

  useEffect(() => {
    const updateComponent = () => {
      getEverythingWithAGeo();
    };

    updateComponent();
  }, [databaseChangesContext]);

  return (
    <>
      <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
        {isReadyToLoadMap ? (
          <MapContainer
            classes={classes}
            mapId={'mainMap'}
            geometryState={{ geometry, setGeometry }}
            interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
            extentState={{ extent, setExtent }}
            contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
          />
        ) : (
          <CircularProgress />
        )}
      </Container>
      <MapContextMenu
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
        handleClose={handleContextMenuClose}
      />
    </>
  );
};

export default MapPage;
