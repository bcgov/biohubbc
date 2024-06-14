import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { MeasurementSelect } from 'features/surveys/animals/profile/measurements/components/MeasurementSelect';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IMeasurementsCreate, IMeasurementsUpdate } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

export const initialMeasurementValues = {
  taxon_measurement_id: undefined,
  qualitative_option_id: undefined,
  value: undefined
};

/**
 * Returns form controls for applying measurements.
 *
 * @template FormikValuesType
 * @return {*}
 */
export const MeasurementsForm = <FormikValuesType extends IMeasurementsCreate | IMeasurementsUpdate>() => {
  const { values } = useFormikContext<FormikValuesType>();

  const critterbaseApi = useCritterbaseApi();
  const animalPageContext = useAnimalPageContext();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  useEffect(() => {
    const tsn = animalPageContext.critterDataLoader.data?.itis_tsn;

    if (!tsn) {
      return;
    }

    measurementsDataLoader.load(tsn);
  }, [animalPageContext.critterDataLoader.data, measurementsDataLoader]);

  return (
    <FieldArray
      name="measurements"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.measurements.map((measurement, index) => (
              <Collapse
                key={
                  ('measurement_quantitative_id' in measurement && measurement.measurement_quantitative_id) ||
                  ('measurement_qualitative_id' in measurement && measurement.measurement_qualitative_id) ||
                  index
                }>
                <Box mb={2}>
                  <MeasurementSelect
                    measurements={[
                      ...(measurementsDataLoader.data?.quantitative ?? []),
                      ...(measurementsDataLoader.data?.qualitative ?? [])
                    ]}
                    arrayHelpers={arrayHelpers}
                    index={index}
                  />
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
            Add Measurement
          </Button>
        </>
      )}
    />
  );
};
