import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Popup } from 'react-leaflet';

export const OccurrenceFeaturePopup: React.FC<{ featureData: any }> = (props) => {
  const { featureData } = props;

  return (
    <Popup key={featureData.id} keepInView={false} autoPan={false}>
      <Box mb={1}>
        <Typography variant="body1">Occurrence</Typography>
      </Box>
      {Object.entries(featureData).map(([key, value]) => {
        if (value) {
          return <div key={key}>{`${key}: ${value}`}</div>;
        }
      })}
    </Popup>
  );
};
