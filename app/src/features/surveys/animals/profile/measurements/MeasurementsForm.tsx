import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { MeasurementSelect } from 'features/surveys/animals/profile/measurements/components/MeasurementSelect';
import { ICreateCritterMeasurement } from 'features/surveys/view/survey-animals/animal';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface IAnimalMeasurementsFormProps {
  formikName: string;
}

/**
 * Returns the control for applying measurements to an animal on the animal capture form
 *
 * @param {IAnimalMeasurementsFormProps} props
 * @return {*}
 */
export const MeasurementsForm = (props: IAnimalMeasurementsFormProps) => {
  const { formikName } = props;

  const { values } = useFormikContext<ICreateEditCaptureRequest>();

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

  const initialMeasurementValues: ICreateCritterMeasurement = {
    taxon_measurement_id: '',
    measurement_qualitative_id: undefined,
    measurement_quantitative_id: undefined,
    measured_timestamp: undefined,
    qualitative_option_id: undefined,
    measurement_comment: undefined,
    value: undefined,
    critter_id: animalPageContext.selectedAnimal?.critterbase_critter_id ?? '',
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
                    <MeasurementSelect
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
