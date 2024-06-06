import grey from '@mui/material/colors/grey';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useCodesContext, useObservationsContext, useObservationsPageContext } from 'hooks/useContext';
import { IGetSampleMethodDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useEffect } from 'react';
import SamplingSiteListPeriod from './SamplingSiteListPeriod';

export interface ISamplingSiteListMethodProps {
  sampleMethod: IGetSampleMethodDetails;
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
          p: 1,
          bgcolor: grey[100],
          '& .MuiTypography-root': {
            fontWeight: 700,
            pt: 0
          }
        }}
        title="Sampling Method"
        primary={sampleMethod.technique.name}
      />
      {sampleMethod.sample_periods.length > 0 && (
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
