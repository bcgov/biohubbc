import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface IInferredLayers {
  parks: string[];
  nrm: string[];
  env: string[];
  wmu: string[];
}

export interface IInferredLocationDetailsProps {
  layers: IInferredLayers;
}

const InferredLocationDetails = (props: IInferredLocationDetailsProps) => {
  const displayInferredLayersInfo = (layerNames: string[], type: string) => {
    if (!layerNames.length) {
      return;
    }

    return (
      <Box className="row">
        <Typography component="dt">
          {type} ({layerNames.length})
        </Typography>
        <Box>
          {data.map((item: string, index: number) => (
            <Typography
              key={name}
              component="dd"
              sx={{
                display: 'inline-block',
                mr: '5px'
              }}>
              {name}
              {index < layerNames.length - 1 && ', '}
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
