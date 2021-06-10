import Box from '@material-ui/core/Box';
import React from 'react';
import { Popup } from 'react-leaflet';

export const SearchFeaturePopup: React.FC<{ featureData: any }> = (props) => {
  const { featureData } = props;

  const popupItems = [];
  for (const property in featureData) {
    if (property !== 'geometry') {
      popupItems.push(`${property}: ${featureData[property]}`);
    }
  }

  return (
    <Popup key={featureData.id} keepInView={false} autoPan={false}>
      <Box p={1}>
        {popupItems.map((item: any) => (
          <div key={item}>{item}</div>
        ))}
      </Box>
    </Popup>
  );
};
