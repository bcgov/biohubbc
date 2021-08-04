import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Feature } from 'geojson';
import React, { useRef } from 'react';
import { Popup, Tooltip } from 'react-leaflet';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export type WFSFeatureKeyHandler = (feature: Feature) => string;

export type WFSFeaturePopupContentHandler = (feature: Feature) => { tooltip: string; content: JSX.Element };

export interface IWFSFeaturePopupProps {
  /**
   * The feature used to render the popup.
   *
   * @type {Feature}
   * @memberof IWFSFeaturePopupProps
   */
  feature: Feature;
  /**
   * Return a unique identifier, for the provided feature.
   *
   * @type {WFSFeatureKeyHandler}
   * @memberof IWFSFeaturePopupProps
   */
  featureKeyHandler: WFSFeatureKeyHandler;
  /**
   * Return a JSX Element to render as the popup content, for the provided feature.
   *
   * @type {WFSFeaturePopupContentHandler}
   * @memberof IWFSFeaturePopupProps
   */
  popupContentHandler: WFSFeaturePopupContentHandler;
  existingGeometry?: Feature[];
  onSelectGeometry?: (geometry: Feature) => void;
}

const WFSFeaturePopup: React.FC<IWFSFeaturePopupProps> = (props) => {
  const { feature, featureKeyHandler, popupContentHandler, existingGeometry, onSelectGeometry } = props;

  const classes = useStyles();

  const popupRef = useRef<any>(null);

  const closePopupDialog = () => {
    popupRef?.current?._closeButton.click();
  };

  const popupContent = popupContentHandler(feature);

  return (
    <>
      <Tooltip direction="top">{popupContent.tooltip}</Tooltip>
      <Popup ref={popupRef} key={`popup-${feature?.properties?.OBJECTID}`} keepInView={false} autoPan={false}>
        <Box p={1}>
          <Box pb={2}>{popupContent.content}</Box>
          {onSelectGeometry && (
            <Box mt={1}>
              <Button
                color="primary"
                variant="contained"
                className={classes.actionButton}
                onClick={() => {
                  if (
                    existingGeometry &&
                    existingGeometry.filter((geo: Feature) => featureKeyHandler(geo) === featureKeyHandler(feature))
                      .length === 0
                  ) {
                    onSelectGeometry?.(feature);
                    closePopupDialog();
                  }
                }}
                data-testid="add_boundary">
                Add Boundary
              </Button>
              <Button color="primary" variant="outlined" className={classes.actionButton} onClick={closePopupDialog}>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Popup>
    </>
  );
};

export default WFSFeaturePopup;
