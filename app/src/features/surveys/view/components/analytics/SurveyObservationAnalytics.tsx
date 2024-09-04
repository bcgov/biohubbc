import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { ObservationAnalyticsDataTableContainer } from 'features/surveys/view/components/analytics/components/ObservationAnalyticsDataTableContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import startCase from 'lodash-es/startCase';
import { useEffect, useState } from 'react';
import { ObservationAnalyticsNoDataOverlay } from './components/ObservationAnalyticsNoDataOverlay';
type GroupByColumnType = 'column' | 'quantitative_measurement' | 'qualitative_measurement';

export type IGroupByOption = {
  label: string;
  field: string;
  type: GroupByColumnType;
};

const initialGroupByColumnOptions: IGroupByOption[] = [
  { label: 'Sampling Site', field: 'survey_sample_site_id', type: 'column' }
];

const allGroupByColumnOptions: IGroupByOption[] = [
  ...initialGroupByColumnOptions,
  { label: 'Sampling Method', field: 'survey_sample_method_id', type: 'column' },
  { label: 'Sampling Period', field: 'survey_sample_period_id', type: 'column' },
  { label: 'Species', field: 'itis_tsn', type: 'column' },
  { label: 'Date', field: 'observation_date', type: 'column' }
];

export const SurveyObservationAnalytics = () => {
  const biohubApi = useBiohubApi();

  const { surveyId, projectId } = useSurveyContext();

  const [groupByColumns, setGroupByColumns] = useState<IGroupByOption[]>(initialGroupByColumnOptions);
  const [groupByQualitativeMeasurements, setGroupByQualitativeMeasurements] = useState<IGroupByOption[]>([]);
  const [groupByQuantitativeMeasurements, setGroupByQuantitativeMeasurements] = useState<IGroupByOption[]>([]);

  const measurementDefinitionsDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationMeasurementDefinitions(projectId, surveyId)
  );

  useEffect(() => {
    measurementDefinitionsDataLoader.load();
  }, [measurementDefinitionsDataLoader]);

  const groupByOptions: IGroupByOption[] = [
    ...allGroupByColumnOptions,
    ...(measurementDefinitionsDataLoader.data?.qualitative_measurements.map((measurement) => ({
      label: startCase(measurement.measurement_name),
      field: measurement.taxon_measurement_id,
      type: 'qualitative_measurement' as GroupByColumnType
    })) ?? []),
    ...(measurementDefinitionsDataLoader.data?.quantitative_measurements.map((measurement) => ({
      label: startCase(measurement.measurement_name),
      field: measurement.taxon_measurement_id,
      type: 'quantitative_measurement' as GroupByColumnType
    })) ?? [])
  ];

  const handleToggleChange = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: IGroupByOption[]) => {
    if (!value[0]?.type) return;

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

  const updateGroupBy = (value: IGroupByOption, setGroupBy: React.Dispatch<React.SetStateAction<IGroupByOption[]>>) =>
    setGroupBy((groupBy) =>
      groupBy.some((item) => item.field === value.field)
        ? groupBy.filter((item) => item.field !== value.field)
        : [...groupBy, value]
    );

  const allGroupByColumns = [...groupByColumns, ...groupByQualitativeMeasurements, ...groupByQuantitativeMeasurements];

  return (
    <Box height="100%" flex="1 1 auto">
      <Stack gap={2} direction="row" height="500px" position="relative">
        <LoadingGuard
          isLoading={measurementDefinitionsDataLoader.isLoading || !measurementDefinitionsDataLoader.isReady}
          isLoadingFallback={
            <Box minWidth="30%">
              <SkeletonList />
            </Box>
          }
          isLoadingFallbackDelay={100}>
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
                  width: '100%',
                  '& .MuiToggleButton-root': {
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
                    key={option.field}
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
                      groupByColumns.some((item) => item.field === option.field) ||
                      groupByQualitativeMeasurements.some((item) => item.field === option.field) ||
                      groupByQuantitativeMeasurements.some((item) => item.field === option.field)
                    }>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        sx={{ pl: 0, py: 0 }}
                        checked={
                          groupByColumns.some((item) => item.field === option.field) ||
                          groupByQualitativeMeasurements.some((item) => item.field === option.field) ||
                          groupByQuantitativeMeasurements.some((item) => item.field === option.field)
                        }
                      />
                      {option.label}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </LoadingGuard>

        <Divider orientation="vertical" />

        {/* Overlay for when no group by columns are selected */}
        {allGroupByColumns.length === 0 && !measurementDefinitionsDataLoader.isLoading && (
          <ObservationAnalyticsNoDataOverlay />
        )}

        {/* Data grid displaying fetched data */}
        {measurementDefinitionsDataLoader.data && allGroupByColumns.length > 0 && (
          <ObservationAnalyticsDataTableContainer
            groupByColumns={groupByColumns}
            groupByQuantitativeMeasurements={groupByQuantitativeMeasurements}
            groupByQualitativeMeasurements={groupByQualitativeMeasurements}
          />
        )}
      </Stack>
    </Box>
  );
};
