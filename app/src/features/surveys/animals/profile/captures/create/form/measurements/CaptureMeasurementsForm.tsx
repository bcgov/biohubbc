import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { ICreateCritterMeasurement } from 'features/surveys/view/survey-animals/animal';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { TransitionGroup } from 'react-transition-group';
import { CaptureMeasurementSelect } from './components/CaptureMeasurementSelect';

interface IAnimalMeasurementsFormProps {
  formikName: string;
}

/**
 * Returns the control for applying measurements to an animal on the animal capture form
 *
 * @returns
 */
const AnimalMeasurementsForm = (props: IAnimalMeasurementsFormProps) => {
  const { formikName } = props;
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
        name={formikName}
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <TransitionGroup>
              {values.measurements.map((measurement, index) => (
                <Collapse
                  in={true}
                  key={
                    ('measurement_quantitative_id' in measurement && measurement.measurement_quantitative_id) ||
                    ('measurement_qualitative_id' in measurement && measurement.measurement_qualitative_id) ||
                    index
                  }>
                  <Box mb={2}>
                    <CaptureMeasurementSelect
                      formikName={formikName}
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
    </>
  );
};

export default AnimalMeasurementsForm;
