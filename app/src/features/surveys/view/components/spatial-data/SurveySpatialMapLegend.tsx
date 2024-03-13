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
    <Stack direction="row" spacing={2}>
      {props?.layers.map(
        (item) =>
          item.layerColors && (
            <Box display="flex" alignItems="center">
              <Box borderRadius="10%" height="1rem" width="1rem" bgcolor={item.layerColors.fillColor} m={1} />
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
