import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsPageContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

const initialEnvironmentValues = {
  environment_quantitative_option_id: undefined,
  environment_qualitative_option_id: undefined,
  value: undefined,
  environment_qualitative_id: undefined,
};

/**
 * Returns form controls for adding environments to the observation subcount.
 *
 * @template FormikValuesType
 * @return {*}
 */
export const ObservationEnvironmentForm = () => {
  const { values } = useFormikContext<IObservationTableRowToSave>();

  const biohubApi = useBiohubApi();
  const observationsPageContext = useObservationsPageContext();

  const environmentsDataLoader = useDataLoader(() => biohubApi.reference.findSubcountEnvironments(''));

  useEffect(() => {
    environmentsDataLoader.load();
  }, [observationsPageContext, environmentsDataLoader]);

  return (
    <FieldArray
      name="subcounts"
      render={(arrayHelpers: FieldArrayRenderProps) => {
        return (
          <>
            <TransitionGroup>
              {values.subcounts.map((subcount, index) => (
                <Collapse key={subcount.observation_subcount_id || index}>
                  <Box mb={2}>
                    <Typography component="legend">Environmental conditions</Typography>
                  </Box>
                </Collapse>
              ))}
            </TransitionGroup>

            <Button
              color="primary"
              variant="outlined"
              startIcon={<Icon path={mdiPlus} size={1} />}
              aria-label="add marking"
              onClick={() => {
                arrayHelpers.push(initialEnvironmentValues);
              }}>
              Add Condition
            </Button>
          </>
        );
      }}
    />
  );
};
