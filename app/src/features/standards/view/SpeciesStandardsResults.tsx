import { mdiRuler, mdiTag } from '@mdi/js';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { ISpeciesStandardsFormikProps } from '../form/SpeciesStandardsForm';
import MarkingBodyLocationStandardCard from './components/MarkingBodyLocationStandardCard';
import MeasurementStandardCard from './components/MeasurementStandardCard';
import SpeciesStandardsToolbar, { SpeciesStandardsViewEnum } from './components/SpeciesStandardsToolbar';

const SpeciesStandardsResults = () => {
  const { values } = useFormikContext<ISpeciesStandardsFormikProps>();
  const biohubApi = useBiohubApi();
  const [activeView, setActiveView] = useState<SpeciesStandardsViewEnum>(SpeciesStandardsViewEnum.MEASUREMENTS);

  const resourcesDataLoader = useDataLoader(() => biohubApi.standards.getSpeciesStandards(values.tsn));

  useEffect(() => {
    if (values.tsn) {
      resourcesDataLoader.refresh();
    }
  }, [values]);

  if (!resourcesDataLoader.data) {
    return <></>;
  } else if (resourcesDataLoader.isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      <Box justifyContent="space-between" display="flex">
        <Typography color="textSecondary">
          Showing results for{' '}
          {resourcesDataLoader.data.scientificName.split(' ').length >= 2 ? (
            <i>{resourcesDataLoader.data?.scientificName}</i>
          ) : (
            resourcesDataLoader.data?.scientificName
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
          {resourcesDataLoader.data?.measurements?.qualitative.map((measurement) => (
            <MeasurementStandardCard
              label={measurement.measurement_name}
              description={measurement.measurement_desc ?? ''}
            />
          ))}
          {resourcesDataLoader.data?.measurements?.quantitative.map((measurement) => (
            <MeasurementStandardCard
              label={measurement.measurement_name}
              description={measurement.measurement_desc ?? ''}
            />
          ))}
        </Stack>
      )}
      {activeView === 'MARKING BODY LOCATIONS' && (
        <Stack gap={2}>
          {resourcesDataLoader.data?.marking_body_locations?.map((location) => (
            <MarkingBodyLocationStandardCard label={location.value} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default SpeciesStandardsResults;
