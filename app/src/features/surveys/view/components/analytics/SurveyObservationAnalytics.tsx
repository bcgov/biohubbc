import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useState } from 'react';
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
    ...(measurementDefinitionsDataLoader.data?.qualitative_measurements.map(
      (measurement) =>
        ({
          label: measurement.measurement_name,
          value: measurement.taxon_measurement_id,
          type: 'qualitative_measurement' as GroupByColumnType
        } ?? [])
    ) ?? []),
    ...(measurementDefinitionsDataLoader.data?.quantitative_measurements.map((measurement) => ({
      label: measurement.measurement_name,
      value: measurement.taxon_measurement_id,
      type: 'quantitative_measurement' as GroupByColumnType
    })) ?? [])
  ];

  const updateGroupBy = (value: IGroupByOption, setGroupBy: React.Dispatch<React.SetStateAction<string[]>>) => {
    setGroupBy((groupBy) => {
      const newGroupBy = groupBy.includes(value.value)
        ? groupBy.filter((item) => item !== value.value)
        : [...groupBy, value.value];

      return newGroupBy;
    });
  };

  return (
    <>
      <Stack gap={2} direction="row" height="500px" position="relative">
        {measurementDefinitionsDataLoader.isLoading ? (
          <Stack direction="row" flex="1 1 auto" spacing={2}>
            <Stack flex="0.2" spacing={1} pt={2}>
              <Skeleton height="25px" width="100%" />
              <Skeleton height="25px" width="100%" />
              <Skeleton height="25px" width="100%" />
              <Skeleton height="25px" width="100%" />
              <Skeleton height="25px" width="100%" />
              <Skeleton height="25px" width="100%" />
            </Stack>
            <Box position="relative" flex="1 1 auto">
              <SkeletonTable numberOfLines={7} />
            </Box>
          </Stack>
        ) : (
          <>
            <ToggleButtonGroup
              orientation="vertical"
              onChange={(_, value: IGroupByOption[]) => {
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
              }}
              sx={{
                height: '100%',
                overflowY: 'auto',
                gap: 0.25,
                minWidth: '250px',
                '& Button': {
                  my: 0.25,
                  py: 0.5,
                  px: 3,
                  pr: 3,
                  border: 'none',
                  borderRadius: '4px !important',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.02rem',
                  textTransform: 'lowercase'
                }
              }}>
              <Typography
                variant="body2"
                fontWeight={700}
                p={1.8}
                bgcolor={grey[50]}
                mb={1}
                borderBottom={`1px solid ${grey[300]}`}>
                GROUP BY
              </Typography>
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
                    ':focus': {
                      outline: 'none',
                      border: 'none'
                    },
                    '&::first-letter': {
                      textTransform: 'capitalize'
                    }
                  }}
                  selected={
                    groupByColumns.includes(option.value) ||
                    groupByQualitativeMeasurements.includes(option.value) ||
                    groupByQuantitativeMeasurements.includes(option.value)
                  }>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Divider orientation="vertical" />
            <ObservationAnalyticsDataTable
              groupByColumns={groupByColumns}
              groupByQuantitativeMeasurements={groupByQuantitativeMeasurements}
              groupByQualitativeMeasurements={groupByQualitativeMeasurements}
              qualitativeMeasurementDefinitions={measurementDefinitionsDataLoader.data?.qualitative_measurements ?? []}
              quantitativeMeasurementDefinitions={
                measurementDefinitionsDataLoader.data?.quantitative_measurements ?? []
              }
            />
          </>
        )}
      </Stack>
    </>
  );
};

export default SurveyObservationAnalytics;
