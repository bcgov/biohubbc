import grey from '@mui/material/colors/grey';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { SamplingSiteListPeriod } from 'features/surveys/observations/sampling-sites/list/SamplingSiteListPeriod';
import { useCodesContext } from 'hooks/useContext';
import { IGetSampleMethodRecord } from 'interfaces/useSurveyApi.interface';
import { useEffect } from 'react';
import { getCodesName } from 'utils/Utils';

export interface ISamplingSiteListMethodProps {
  sampleMethod: IGetSampleMethodRecord;
}

export const SamplingSiteListMethod = (props: ISamplingSiteListMethodProps) => {
  const { sampleMethod } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  return (
    <ListItem
      disableGutters
      key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
      sx={{
        display: 'block',
        p: 0,
        '& + li': {
          mt: 1.5
        }
      }}>
      <ListItemText
        sx={{
          px: 2,
          py: 1,
          background: grey[100]
        }}
        title="Sampling Method"
        primary={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', sampleMethod.method_lookup_id)}
      />
      <List disablePadding>
        {sampleMethod.sample_periods?.map((samplePeriod) => {
          return <SamplingSiteListPeriod samplePeriod={samplePeriod} />;
        })}
      </List>
    </ListItem>
  );
};
