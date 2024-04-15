import { mdiRuler, mdiTag } from '@mdi/js';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { IGetSpeciesStandardsResponse } from 'interfaces/useStandardsApi.interface';
import { useState } from 'react';
import MarkingBodyLocationStandardCard from './components/MarkingBodyLocationStandardCard';
import MeasurementStandardCard from './components/MeasurementStandardCard';
import SpeciesStandardsToolbar, { SpeciesStandardsViewEnum } from './components/SpeciesStandardsToolbar';

interface ISpeciesStandardsResultsProps {
  data?: IGetSpeciesStandardsResponse;
  isLoading: boolean;
}

/**
 * Component to display species standards results
 *
 * @return {*}
 */
const SpeciesStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const [activeView, setActiveView] = useState<SpeciesStandardsViewEnum>(SpeciesStandardsViewEnum.MEASUREMENTS);

  if (props.isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!props.data) {
    return <></>;
  }

  return (
    <>
      <Box justifyContent="space-between" display="flex">
        <Typography color="textSecondary">
          Showing results for{' '}
          {props.data.scientificName.split(' ').length >= 2 ? (
            <i>{props.data.scientificName}</i>
          ) : (
            props.data.scientificName
          )}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box my={2}>
        <SpeciesStandardsToolbar
          views={[
            {
              label: `Measurements`,
              value: SpeciesStandardsViewEnum.MEASUREMENTS,
              icon: mdiRuler,
              isLoading: false
            },
            {
              label: `Marking body locations`,
              value: SpeciesStandardsViewEnum.MARKING_BODY_LOCATIONS,
              icon: mdiTag,
              isLoading: false
            }
          ]}
          activeView={activeView}
          updateDatasetView={setActiveView}
        />
      </Box>

      {activeView === 'MEASUREMENTS' && (
        <Stack gap={2}>
          {props.data.measurements.qualitative.map((measurement) => (
            <MeasurementStandardCard
              label={measurement.measurement_name}
              description={measurement.measurement_desc ?? ''}
              options={measurement.options}
            />
          ))}
          {props.data.measurements.quantitative.map((measurement) => (
            <MeasurementStandardCard
              label={measurement.measurement_name}
              description={measurement.measurement_desc ?? ''}
            />
          ))}
        </Stack>
      )}
      {activeView === 'MARKING BODY LOCATIONS' && (
        <Stack gap={2}>
          {props.data.markingBodyLocations.map((location) => (
            <MarkingBodyLocationStandardCard label={location.value} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default SpeciesStandardsResults;
