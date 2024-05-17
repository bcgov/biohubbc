import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ICreateCritterMeasurement } from 'features/surveys/view/survey-animals/animal';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { CaptureMeasurementSelect } from './components/CaptureMeasurementSelect';

/**
 * Returns the control for applying measurements to an animal on the animal capture form
 *
 * @returns
 */
const CaptureMeasurementsForm = () => {
  const critterbaseApi = useCritterbaseApi();
  const { critterDataLoader, selectedAnimal } = useAnimalPageContext();

  const { values } = useFormikContext<ICreateEditCaptureRequest>();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  if (!measurementsDataLoader.data) {
    const tsn = critterDataLoader.data?.itis_tsn;
    if (tsn) {
      measurementsDataLoader.load(tsn);
    }
  }

  const initialMeasurementValues: ICreateCritterMeasurement = {
    taxon_measurement_id: '',
    measurement_qualitative_id: undefined,
    measurement_quantitative_id: undefined,
    measured_timestamp: undefined,
    qualitative_option_id: undefined,
    measurement_comment: undefined,
    value: undefined,
    critter_id: selectedAnimal?.critterbase_critter_id ?? '',
    mortality_id: undefined,
    capture_id: undefined
  };

  return (
    <>
      <FieldArray
        name="measurements"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            {values.measurements.length > 0 && (
              <Stack mb={3} spacing={1}>
                {values.measurements.map((measurement, index) => (
                  <CaptureMeasurementSelect
                    key={measurement.taxon_measurement_id ?? index}
                    measurements={[
                      ...(measurementsDataLoader.data?.quantitative ?? []),
                      ...(measurementsDataLoader.data?.qualitative ?? [])
                    ]}
                    arrayHelpers={arrayHelpers}
                    index={index}
                  />
                ))}
              </Stack>
            )}

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
    </>
  );
};

export default CaptureMeasurementsForm;
