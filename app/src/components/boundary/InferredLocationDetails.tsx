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
      <Box className="mapLocations">
        <Typography variant="h3">
          {type} ({data.length})
        </Typography>
        {data.map((item: string, index: number) => (
          <Typography key={index} variant="body1">
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
      {displayInferredLayersInfo(props.layers.env, 'Ministry of Environment Regions')}
      {displayInferredLayersInfo(props.layers.wmu, 'Management Unit / Game Management Zones')}
      {displayInferredLayersInfo(props.layers.parks, 'Parks and EcoReserves')}
    </>
  );
};

export default InferredLocationDetails;
