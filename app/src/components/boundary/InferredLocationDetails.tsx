import Box from '@material-ui/core/Box';
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
      <Box>
        <Typography variant="body2" color="textSecondary">
          {type} ({data.length})
        </Typography>

        {data.map((item: string, index: number) => (
          <Typography key={index} variant="body1" component="div">
            {item}
            {index < data.length - 1 && ', '}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <>
      {displayInferredLayersInfo(props.layers.nrm, 'Natural Resource Ministries Regions')}
      <Box mt={3}>{displayInferredLayersInfo(props.layers.env, 'Ministry of Environment Regions')}</Box>
      <Box mt={3}>{displayInferredLayersInfo(props.layers.wmu, 'Management Unit / Game Management Zones')}</Box>
      <Box mt={3}>{displayInferredLayersInfo(props.layers.parks, 'Parks and EcoReserves')}</Box>
    </>
  );
};

export default InferredLocationDetails;
