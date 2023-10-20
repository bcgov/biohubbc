import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Popup } from 'react-leaflet';
import { useHistory } from 'react-router';
import { isAuthenticated } from 'utils/authUtils';

export const SearchFeaturePopup: React.FC<{ featureData: any }> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const history = useHistory();

  const { featureData } = props;

  return (
    <Popup key={featureData.id} keepInView={false} autoPan={false}>
      <Box mb={2}>
        <Typography variant="body1">Project: {featureData.name}</Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (isAuthenticated(keycloakWrapper)) {
            history.push(`/admin/projects/${featureData.id}`);
          } else {
            history.push(`/projects/${featureData.id}`);
          }
        }}>
        View Project Details
      </Button>
    </Popup>
  );
};
