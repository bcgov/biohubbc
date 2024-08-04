import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useState } from 'react';
import { SurveyObservationAnalyticsOverlay } from './components/SurveyObservationAnalyticsOverlay';
import ObservationAnalyticsDataTable from './ObservationAnalyticsDataTable';
type GroupByColumnType = 'column' | 'quantitative_measurement' | 'qualitative_measurement';

interface IGroupByOption {
  label: string;
  value: string;
  type: GroupByColumnType;
}

const groupByColumnOptions: IGroupByOption[] = [
  { label: 'Sampling Site', value: 'survey_sample_site_id', type: 'column' },
  { label: 'Sampling Method', value: 'survey_sample_method_id', type: 'column' },
  { label: 'Sampling Period', value: 'survey_sample_period_id', type: 'column' },
  { label: 'Species', value: 'itis_tsn', type: 'column' },
  { label: 'Date', value: 'observation_date', type: 'column' }
];

const SurveyObservationAnalytics = () => {
  const biohubApi = useBiohubApi();

  const { surveyId, projectId } = useSurveyContext();

  const [groupByColumns, setGroupByColumns] = useState<string[]>([groupByColumnOptions[0].value]);
  const [groupByQualitativeMeasurements, setGroupByQualitativeMeasurements] = useState<string[]>([]);
  const [groupByQuantitativeMeasurements, setGroupByQuantitativeMeasurements] = useState<string[]>([]);

  const measurementDefinitionsDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationMeasurementDefinitions(projectId, surveyId)
  );
  measurementDefinitionsDataLoader.load();

  const groupByOptions: IGroupByOption[] = [
    ...groupByColumnOptions,
    ...(measurementDefinitionsDataLoader.data?.qualitative_measurements.map((measurement) => ({
      label: measurement.measurement_name,
      value: measurement.taxon_measurement_id,
      type: 'qualitative_measurement' as GroupByColumnType
    })) ?? []),
    ...(measurementDefinitionsDataLoader.data?.quantitative_measurements.map((measurement) => ({
      label: measurement.measurement_name,
      value: measurement.taxon_measurement_id,
      type: 'quantitative_measurement' as GroupByColumnType
    })) ?? [])
  ];

  const handleToggleChange = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: IGroupByOption[]) => {
    if (!value || !value[0]?.type) return;

    // Update group by arrays
    if (value[0].type === 'column') {
      updateGroupBy(value[0], setGroupByColumns);
    }
    if (value[0].type === 'qualitative_measurement') {
      updateGroupBy(value[0], setGroupByQualitativeMeasurements);
    }
    if (value[0].type === 'quantitative_measurement') {
      updateGroupBy(value[0], setGroupByQuantitativeMeasurements);
    }
  };

  const updateGroupBy = (value: IGroupByOption, setGroupBy: React.Dispatch<React.SetStateAction<string[]>>) =>
    setGroupBy((groupBy) =>
      groupBy.includes(value.value) ? groupBy.filter((item) => item !== value.value) : [...groupBy, value.value]
    );

  const combinedGroupByColumns = [
    ...groupByColumns,
    ...groupByQualitativeMeasurements,
    ...groupByQuantitativeMeasurements
  ];

  return (
    <Box height="100%" flex="1 1 auto">
      <Stack gap={2} direction="row" height="500px" position="relative">
        {/* Skeleton loaders for pending requests */}
        {measurementDefinitionsDataLoader.isLoading ? (
          <Box minWidth="30%">
            <SkeletonList />
          </Box>
        ) : (
          <Box minWidth="250px">
            {/* Group by header */}
            <Typography
              variant="body2"
              fontWeight={700}
              py={1.8}
              px={3}
              bgcolor={grey[50]}
              borderBottom={`1px solid ${grey[300]}`}>
              GROUP BY
            </Typography>
            <Box sx={{ height: '90%', overflowY: 'auto' }}>
              <ToggleButtonGroup
                orientation="vertical"
                onChange={handleToggleChange}
                sx={{
                  bgcolor: grey[50],
                  width: '100%',
                  '& .MuiToggleButton-root': {
                    bgcolor: grey[50],
                    border: 'none',
                    outline: 'none',
                    borderRadius: '4px !important',
                    fontSize: '0.875rem',
                    letterSpacing: '0.02rem',
                    textTransform: 'none',
                    '&::first-letter': {
                      textTransform: 'capitalize !important'
                    }
                  }
                }}>
                {/* Render toggle buttons for each group by option */}
                {groupByOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    component={Button}
                    color="primary"
                    value={option}
                    sx={{
                      textAlign: 'left',
                      display: 'block',
                      border: 'none',
                      outline: 'none',
                      fontWeight: 700,
                      my: 1,
                      mx: 1,
                      ':focus': {
                        outline: 'none',
                        border: 'none'
                      }
                    }}
                    selected={
                      groupByColumns.includes(option.value) ||
                      groupByQualitativeMeasurements.includes(option.value) ||
                      groupByQuantitativeMeasurements.includes(option.value)
                    }>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        sx={{ pl: 0, py: 0 }}
                        checked={
                          groupByColumns.includes(option.value) ||
                          groupByQualitativeMeasurements.includes(option.value) ||
                          groupByQuantitativeMeasurements.includes(option.value)
                        }
                      />
                      {option.label}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        )}

        <Divider orientation="vertical" />

        {/* Overlay for when no group by columns are selected */}
        {combinedGroupByColumns.length === 0 && !measurementDefinitionsDataLoader.isLoading && (
          <SurveyObservationAnalyticsOverlay />
        )}

        {/* Data grid displaying fetched data */}
        {measurementDefinitionsDataLoader.data && combinedGroupByColumns.length > 0 && (
          <ObservationAnalyticsDataTable
            groupByColumns={groupByColumns}
            groupByQuantitativeMeasurements={groupByQuantitativeMeasurements}
            groupByQualitativeMeasurements={groupByQualitativeMeasurements}
            qualitativeMeasurementDefinitions={measurementDefinitionsDataLoader.data?.qualitative_measurements ?? []}
            quantitativeMeasurementDefinitions={measurementDefinitionsDataLoader.data?.quantitative_measurements ?? []}
          />
        )}
      </Stack>
    </Box>
  );
};

export default SurveyObservationAnalytics;
