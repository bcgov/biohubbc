import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useCodesContext, useObservationsContext, useObservationsPageContext } from 'hooks/useContext';
import { useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import SamplingSiteListPeriod from './SamplingSiteListPeriod';
import { IGetSampleMethodRecord } from 'interfaces/useSamplingSiteApi.interface';

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
      sx={{
        p: 0,
        display: 'block',
        '& + li': {
          mt: 0.5
        }
      }}>
      <ListItemText
        sx={{
          p: 0,
          mt: 0,
          '& .MuiTypography-root': {
            fontWeight: 700
          }
        }}
        title="Sampling Method"
        primary={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', sampleMethod.method_lookup_id)}
      />
      {sampleMethod.sample_periods?.length && (
        <List disablePadding sx={{ ml: 0.5 }}>
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
