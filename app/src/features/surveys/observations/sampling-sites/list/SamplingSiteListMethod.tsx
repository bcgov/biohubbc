import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import grey from '@mui/material/colors/grey';
import { useCodesContext, useObservationsContext, useObservationsPageContext } from 'hooks/useContext';
import { IGetSampleMethodRecord } from 'interfaces/useSurveyApi.interface';
import { useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import SamplingSiteListPeriod from './SamplingSiteListPeriod';

export interface ISamplingSiteListMethodProps {
  sampleMethod: IGetSampleMethodRecord;
}

/**
 * Renders a list item for a single sampling method.
 *
 * @param {ISamplingSiteListMethodProps} props
 * @return {*}
 */
export const SamplingSiteListMethod = (props: ISamplingSiteListMethodProps) => {
  const { sampleMethod } = props;

  const codesContext = useCodesContext();
  const observationsPageContext = useObservationsPageContext();
  const observationsContext = useObservationsContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  return (
    <ListItem
      disableGutters
      sx={{
        display: 'block',
        p: 0,
        '& + li': {
          mt: 1.5,
        }
      }}>
      <ListItemText
        sx={{
          px: 2,
          py: 1,
          background: grey[200],
          borderRadius: '5px'
        }}
        title="Sampling Method"
        primary={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', sampleMethod.method_lookup_id)}
      />
      {sampleMethod.sample_periods?.length && (
        <List disablePadding>
          <SamplingSiteListPeriod
            samplePeriods={sampleMethod.sample_periods}
            observationsContext={observationsContext}
            observationsPageContext={observationsPageContext}
          />
        </List>
      )}
    </ListItem>
  );
};
