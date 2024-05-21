import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ObservationAnalyticsDataTable from './ObservationAnalyticsDataTable';

type GroupByColumnType = 'column' | 'quantitative_measurement' | 'qualitative_measurement';

interface IGroupByOption {
  label: string;
  value: string;
  type: GroupByColumnType;
}

const groupByOptions: IGroupByOption[] = [
  { label: 'Sampling Site', value: 'survey_sample_site_id', type: 'column' },
  { label: 'Sampling Method', value: 'survey_sample_method_id', type: 'column' },
  { label: 'Sampling Period', value: 'survey_sample_period_id', type: 'column' },
  { label: 'Species', value: 'itis_tsn', type: 'column' },
  { label: 'Date', value: 'observation_date', type: 'column' },
  { label: 'body mass', value: 'acde6ee5-b0d2-46ae-a535-0c258fdf0695', type: 'quantitative_measurement' },
  { label: 'body lenght', value: '4ee309bd-5176-4fdf-98cc-38d3b9b5eac2', type: 'quantitative_measurement' }
];

const SurveyObservationAnalytics = () => {
  const [groupByColumns, setGroupByColumns] = useState<string[]>([groupByOptions[0].value]);
  const [groupByQualitativeMeasurements, setGroupByQualitativeMeasurements] = useState<string[]>([]);
  const [groupByQuantitativeMeasurements, setGroupByQuantitativeMeasurements] = useState<string[]>([]);

  const updateGroupBy = (value: IGroupByOption, setGroupBy: React.Dispatch<React.SetStateAction<string[]>>) => {
    setGroupBy((groupBy) =>
      groupBy.includes(value.value) ? groupBy.filter((item) => item !== value.value) : [...groupBy, value.value]
    );
  };

  console.log(groupByColumns);
  console.log(groupByQualitativeMeasurements);
  console.log(groupByQuantitativeMeasurements);

  return (
    <Stack gap={2} direction="row" height="500px">
      <ToggleButtonGroup
        orientation="vertical"
        onChange={(_, value: IGroupByOption[]) => {
          // value is an array
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
          overflow: 'auto',
          gap: 0.25,
          minWidth: '250px',
          '& Button': {
            my: 0.25,
            py: 0.5,
            px: 2,
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
            value={option}
            sx={{
              textAlign: 'left',
              display: 'block',
              fontSize: '0.85rem',
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
      />
    </Stack>
  );
};

export default SurveyObservationAnalytics;
