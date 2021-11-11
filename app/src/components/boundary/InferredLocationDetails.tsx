import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export interface IInferredLayers {
  parks: string[];
  nrm: string[];
  env: string[];
  wmu: string[];
}

export interface IInferredLocationDetailsProps {
  layers: IInferredLayers;
}

const InferredLocationDetails: React.FC<IInferredLocationDetailsProps> = (props) => {
  const displayInferredLayersInfo = (data: any[], type: string) => {
    if (!data.length) {
      return;
    }

    return (
      <Box className="mapLocations">
        <Typography component="div" variant="subtitle2" color="textSecondary">
          {type} {data.length}
        </Typography>
        {data.map((item: string, index: number) => (
          <Typography key={index} component="span" variant="body1">
            {item}
            {index < data.length - 1 && ', '}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {displayInferredLayersInfo(props.layers.nrm, 'Natural Resource Ministries Regions')}
        </Grid>
        <Grid item xs={6}>
          {displayInferredLayersInfo(props.layers.env, 'Ministry of Environment Regions')}
        </Grid>
        <Grid item xs={6}>
          {displayInferredLayersInfo(props.layers.wmu, 'Management Unit / Game Management Zones')}
        </Grid>
        <Grid item xs={6}>
          {displayInferredLayersInfo(props.layers.parks, 'Parks and EcoReserves')}
        </Grid>
      </Grid>
    </>
  );
};

export default InferredLocationDetails;
