import Box from '@material-ui/core/Box';
import { Feature } from 'geojson';
import React from 'react';
import { Popup } from 'react-leaflet';

export const ObservationFeaturePopup: React.FC<{ feature: Feature }> = (props) => {
  const { feature } = props;

  const popupItems: JSX.Element[] = [];

  popupItems.push(<div>test 1</div>);
  popupItems.push(<div>test 2</div>);

  return (
    <Popup key={`popup-${feature?.properties?.OBJECTID}`} keepInView={false} autoPan={false}>
      <Box p={1}>
        {popupItems}
      </Box>
    </Popup>
  );
};
