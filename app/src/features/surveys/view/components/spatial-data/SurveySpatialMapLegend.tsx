import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SurveySpatialDatasetViewEnum } from './SurveySpatialToolbar';

interface ISurveySpatialMapLegendProps {
  activeView: SurveySpatialDatasetViewEnum;
  layers: IStaticLayer[];
}

const SurveySpatialMapLegend = (props: ISurveySpatialMapLegendProps) => {
  return (
    <Stack direction="row" spacing={1}>
      {props?.layers.map(
        (item, index) =>
          item.layerColors && (
            <Box key={`${item.layerName}-${index}`} display="flex" alignItems="center">
              <Box
                border={item.layerColors.color}
                borderRadius="50%"
                height="0.8rem"
                width="0.8rem"
                bgcolor={item.layerColors.fillColor}
                m={1}
              />
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 700 }}>
                {item.layerName}
              </Typography>
            </Box>
          )
      )}
    </Stack>
  );
};

export default SurveySpatialMapLegend;
