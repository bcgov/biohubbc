import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { generateCustomPointMarkerUrl } from 'utils/mapUtils';
import { SurveySpatialDatasetViewEnum } from './SurveySpatialToolbar';

interface ISurveySpatialMapLegendProps {
  activeView: SurveySpatialDatasetViewEnum;
  layers: IStaticLayer[];
}

const SurveySpatialMapLegend = (props: ISurveySpatialMapLegendProps) => {
  const observationsMapMarker = generateCustomPointMarkerUrl(
    props.layers.find((layer) => layer.layerName === 'Observations')?.layerColors?.fillColor
  );

  return (
    <Stack direction="row" spacing={1}>
      {props?.layers.map(
        (item, index) =>
          item.layerColors && (
            <Box key={`${item.layerName}-${index}`} display="flex" alignItems="center">
              {item.layerName === 'Observations' ? (
                <Box component="img" src={observationsMapMarker} maxHeight="15px" m={1} />
              ) : (
                <Box
                  border={item.layerColors.color}
                  borderRadius="1px"
                  height="0.85rem"
                  width="0.85rem"
                  bgcolor={item.layerColors.fillColor}
                  m={1}
                />
              )}
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
