import { mdiRuler, mdiTag } from '@mdi/js';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useEffect, useState } from 'react';
import MarkingBodyLocationStandardCard from './components/MarkingBodyLocationStandardCard';
import MeasurementStandardCard from './components/MeasurementStandardCard';
import SpeciesStandardsToolbar, { SpeciesStandardsViewEnum } from './components/SpeciesStandardsToolbar';

interface ISpeciesStandardsResultsProps {
  selectedSpecies?: ITaxonomy;
}

/**
 * Component to display species standards results
 *
 * @return {*}
 */
const SpeciesStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const biohubApi = useBiohubApi();
  const [activeView, setActiveView] = useState<SpeciesStandardsViewEnum>(SpeciesStandardsViewEnum.MEASUREMENTS);

  const resourcesDataLoader = useDataLoader((tsn: number) => biohubApi.standards.getSpeciesStandards(tsn));

  useEffect(() => {
    if (props.selectedSpecies) {
      resourcesDataLoader.refresh(props.selectedSpecies.tsn);
    }
  }, [props.selectedSpecies?.tsn]);

  if (!resourcesDataLoader.data) {
    return <></>;
  }

  if (resourcesDataLoader.isLoading) {
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
              options={measurement.options}
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
          {resourcesDataLoader.data?.markingBodyLocations?.map((location) => (
            <MarkingBodyLocationStandardCard label={location.value} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default SpeciesStandardsResults;
