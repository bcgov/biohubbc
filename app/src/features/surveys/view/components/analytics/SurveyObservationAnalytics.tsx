import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';

const SurveyObservationAnalytics = () => {
  const biohubApi = useBiohubApi();
  const { surveyId } = useSurveyContext();

  const [groupBy, setGroupBy] = useState<string[]>([]);

  const analyticsDataLoader = useDataLoader((surveyId: number, groupBy: string[]) =>
    biohubApi.analytics.getObservationCountByGroup([surveyId], groupBy)
  );

  useEffect(() => {
    analyticsDataLoader.refresh(surveyId, groupBy);
  }, [groupBy]);

  const analytics = analyticsDataLoader.data;

  const groupByOptions = [
    { label: 'Site', value: 'survey_sample_site_id' },
    { label: 'Sampling Method', value: 'survey_sample_method_id' },
    { label: 'Species', value: 'itis_tsn' },
    { label: 'Date', value: 'observation_date' }
  ];

  if (!analytics) {
    return <></>;
  }

  console.log(groupBy);

  return (
    <Stack gap={2} direction="row">
      <ToggleButtonGroup
        orientation="vertical"
        onChange={(_, value) =>
          // value is an array
          setGroupBy((groupBy) =>
            groupBy.includes(value[0]) ? groupBy.filter((item) => item !== value[0]) : [...groupBy, ...value]
          )
        }
        sx={{
          flex: '0.3',
          gap: 0.5,
          '& Button': {
            my: 0.25,
            py: 0.5,
            px: 1.5,
            border: 'none',
            borderRadius: '4px !important',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.02rem'
          }
        }}>
        {groupByOptions.map((option) => (
          <ToggleButton
            key={option.value}
            component={Button}
            color="primary"
            value={option.value}
            selected={groupBy.includes(option.value)}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box>{analytics.count}</Box>
    </Stack>
  );
};

export default SurveyObservationAnalytics;
