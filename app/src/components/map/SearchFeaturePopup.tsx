import Box from '@material-ui/core/Box';
import { Feature } from 'geojson';
import React from 'react';
import { Popup } from 'react-leaflet';

export const SearchFeaturePopup: React.FC<{ feature: Feature; popupData?: any[] }> = (props) => {
  const { feature, popupData } = props;

  let featureData: any;
  popupData?.forEach((item: any) => {
    if (item.id === feature.id) {
      featureData = item;
    }
  });

  const popupItems = [];
  for (const property in featureData) {
    if (property !== 'geometry') {
      popupItems.push(`${property}: ${featureData[property]}`);
    }
  }

  return (
    <Popup key={feature.id} keepInView={false} autoPan={false}>
      <Box p={1}>
        {popupItems.map((item: any) => (
          <div key={item}>{item}</div>
        ))}
      </Box>
    </Popup>
  );
};
