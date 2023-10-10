import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
      <Box className="row">
        <Typography component="dt">
          {type} ({data.length})
        </Typography>
        <Box>
          {data.map((item: string, index: number) => (
            <Typography key={index} component="dd"
              sx={{
                display: 'inline-block',
                mr: '5px'
              }}
            >
              {item}
              {index < data.length - 1 && ', '}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {displayInferredLayersInfo(props.layers.nrm, 'Natural Resource Ministries Regions')}
      {displayInferredLayersInfo(props.layers.env, 'Ministry of Environment Regions')}
      {displayInferredLayersInfo(props.layers.parks, 'Parks and EcoReserves')}
    </>
  );
};

export default InferredLocationDetails;
