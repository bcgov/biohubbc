import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import { useObservationsPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

export const initialMeasurementValues = {
  taxon_measurement_id: undefined,
  qualitative_option_id: undefined,
  value: undefined
};

/**
 * Returns form controls for adding measurements to the observation subcount.
 *
 * @template FormikValuesType
 * @return {*}
 */
export const ObservationMeasurementForm = () => {
  const { values } = useFormikContext<IObservationTableRowToSave>();

  const critterbaseApi = useCritterbaseApi();
  const observationsPageContext = useObservationsPageContext();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  useEffect(() => {
    const tsn = values.standardColumns.itis_tsn;

    if (!tsn) {
      return;
    }

    measurementsDataLoader.load(tsn);
  }, [observationsPageContext, measurementsDataLoader]);

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
                    <Typography component="legend">Species attributes</Typography>
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
                arrayHelpers.push(initialMeasurementValues);
              }}>
              Add Attribute
            </Button>
          </>
        );
      }}
    />
  );
};
