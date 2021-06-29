import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Popup } from 'react-leaflet';

export const SearchFeaturePopup: React.FC<{ featureData: any; history: any }> = (props) => {
  const { featureData, history } = props;

  return (
    <Popup key={featureData.id} keepInView={false} autoPan={false}>
      <Box mb={2}>
        <Typography variant="body1">Project: {featureData.name}</Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={() => history.push(`/projects/${featureData.id}`)}>
        View Project Details
      </Button>
    </Popup>
  );
};
