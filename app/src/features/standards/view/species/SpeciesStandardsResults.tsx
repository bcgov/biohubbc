import { mdiRuler, mdiTag } from '@mdi/js';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { AccordionStandardCard } from 'features/standards/components/AccordionStandardCard';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { ISpeciesStandards } from 'interfaces/useStandardsApi.interface';
import { useState } from 'react';
import MarkingBodyLocationStandardCard from '../components/MarkingBodyLocationStandardCard';
import SpeciesStandardsToolbar, { SpeciesStandardsViewEnum } from '../components/SpeciesStandardsToolbar';

interface ISpeciesStandardsResultsProps {
  data: ISpeciesStandards;
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

  return (
    <>
      <Box justifyContent="space-between" display="flex">
        <Typography color="textSecondary">
          Showing results for&nbsp;
          <ScientificNameTypography name={props.data.scientificName} component="span" />
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

      {activeView === SpeciesStandardsViewEnum.MEASUREMENTS && (
        <Stack gap={2}>
          {props.data.measurements.qualitative.map((measurement) => (
            <AccordionStandardCard
              label={measurement.measurement_name}
              subtitle={measurement.measurement_desc ?? ''}
              colour={grey[100]}
              children={
                <Stack gap={2} my={2}>
                  {measurement.options.map((option) => (
                    <AccordionStandardCard
                      key={option.option_label}
                      label={option.option_label}
                      subtitle={option.option_desc ?? ''}
                      colour={grey[200]}
                    />
                  ))}
                </Stack>
              }
            />
          ))}
          {props.data.measurements.quantitative.map((measurement) => (
            <AccordionStandardCard
              label={measurement.measurement_name}
              subtitle={measurement.measurement_desc ?? ''}
              colour={grey[100]}
            />
          ))}
        </Stack>
      )}
      {activeView === SpeciesStandardsViewEnum.MARKING_BODY_LOCATIONS && (
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
