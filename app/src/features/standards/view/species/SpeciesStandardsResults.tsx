import { mdiBook, mdiRuler, mdiTag } from '@mdi/js';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { blueGrey, grey } from '@mui/material/colors';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { ISpeciesStandards } from 'interfaces/useStandardsApi.interface';
import { useState } from 'react';
import { SpeciesStandardsEcologicalUnitCard } from './ecological-unit/SpeciesStandardsEcologicalUnitCard';

enum SpeciesStandardsViewEnum {
  MEASUREMENTS = 'measurements',
  MARKING_BODY_LOCATIONS = 'marking_body_locations',
  ECOLOGICAL_UNIT = 'ecological_unit'
}

interface ISpeciesStandardsResultsProps {
  data?: ISpeciesStandards;
}

/**
 * Component to display species standards results
 *
 * @return {*}
 */
const SpeciesStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const [activeView, setActiveView] = useState<SpeciesStandardsViewEnum>(SpeciesStandardsViewEnum.MEASUREMENTS);

  if (!props.data) {
    // No data to display
    return null;
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
        <CustomToggleButtonGroup
          views={[
            { value: SpeciesStandardsViewEnum.MEASUREMENTS, label: 'Measurements', icon: mdiRuler },
            { value: SpeciesStandardsViewEnum.MARKING_BODY_LOCATIONS, label: 'Marking body locations', icon: mdiTag },
            { value: SpeciesStandardsViewEnum.ECOLOGICAL_UNIT, label: 'Ecological Unit', icon: mdiBook }
          ]}
          activeView={activeView}
          onViewChange={setActiveView}
          orientation="horizontal"
        />
      </Box>
      <Stack gap={2}>
        {activeView === SpeciesStandardsViewEnum.MEASUREMENTS && (
          <>
            {props.data.measurements.qualitative.map((measurement) => (
              <AccordionStandardCard
                key={measurement.taxon_measurement_id}
                label={measurement.measurement_name}
                subtitle={measurement.measurement_desc}
                colour={grey[100]}>
                <Stack gap={2} my={2}>
                  {measurement.options.map((option) => (
                    <AccordionStandardCard
                      key={option.qualitative_option_id}
                      label={option.option_label}
                      subtitle={option.option_desc}
                      colour={grey[200]}
                      disableCollapse
                    />
                  ))}
                </Stack>
              </AccordionStandardCard>
            ))}
            {props.data.measurements.quantitative.map((measurement) => (
              <AccordionStandardCard
                key={measurement.taxon_measurement_id}
                label={measurement.measurement_name}
                subtitle={measurement.measurement_desc}
                ornament={
                  measurement.unit ? <ColouredRectangleChip label={measurement.unit} colour={blueGrey} /> : <></>
                }
                colour={grey[100]}
              />
            ))}
          </>
        )}
        {activeView === SpeciesStandardsViewEnum.MARKING_BODY_LOCATIONS && (
          <>
            {props.data.markingBodyLocations.map((location) => (
              <AccordionStandardCard label={location.value} colour={grey[100]} disableCollapse key={location.id} />
            ))}
          </>
        )}
        {activeView === SpeciesStandardsViewEnum.ECOLOGICAL_UNIT && (
          <LoadingGuard
            hasNoData={!props.data.ecologicalUnits.length}
            hasNoDataFallback={
              <NoDataOverlay
                sx={{ minHeight: '300px' }}
                title="No Ecological Units"
                subtitle="This taxon does not have any ecological units. Contact a system administrator to make suggestions."
              />
            }>
            {props.data.ecologicalUnits.map((category) => (
              <AccordionStandardCard
                key={category.collection_category_id}
                label={category.category_name}
                subtitle={category.description}
                colour={grey[100]}>
                <SpeciesStandardsEcologicalUnitCard collectionCategoryId={category.collection_category_id} />
              </AccordionStandardCard>
            ))}
          </LoadingGuard>
        )}
      </Stack>
    </>
  );
};

export default SpeciesStandardsResults;
