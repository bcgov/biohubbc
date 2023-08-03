import { Grid } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, FormikErrors, useFormikContext } from 'formik';
import { getAnimalFieldName, IAnimal, IAnimalCapture } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';
import LocationEntryForm from './LocationEntryForm';
/**
 * Renders the Capture section for the Individual Animal form
 *
 * Note A: Using <FieldArray/> the name properties must stay in sync with
 * values object and nested arrays.
 * ie: values = { capture: [{id: 'test'}] };  name = 'capture.[0].id';
 *
 * Note B: FormSectionWrapper uses a Grid container to render children elements.
 * Children of FormSectionWrapper can use Grid items to organize inputs.
 *
 * Returns {*}
 */

type ProjectionMode = 'wgs' | 'utm';
const CaptureAnimalForm = () => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'capture';
  const newCapture: IAnimalCapture = {
    capture_latitude: '' as unknown as number,
    capture_longitude: '' as unknown as number,
    capture_utm_northing: '' as unknown as number,
    capture_utm_easting: '' as unknown as number,
    capture_comment: '',
    capture_coordinate_uncertainty: 10,
    capture_timestamp: '' as unknown as Date,
    release_latitude: '' as unknown as number,
    release_longitude: '' as unknown as number,
    release_utm_northing: '' as unknown as number,
    release_utm_easting: '' as unknown as number,
    release_comment: '',
    release_timestamp: '' as unknown as Date,
    release_coordinate_uncertainty: 10,
    projection_mode: 'wgs' as ProjectionMode
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCaptureTitle}
            titleHelp={SurveyAnimalsI18N.animalCaptureHelp}
            btnLabel={SurveyAnimalsI18N.animalCaptureAddBtn}
            handleAddSection={() => push(newCapture)}
            handleRemoveSection={remove}>
            {values.capture.map((_cap, index) => (
              <CaptureAnimalFormContent
                key={`${name}-${index}-inputs`}
                name={name}
                index={index}
                setFieldValue={setFieldValue}
                value={_cap}
              />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface CaptureAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<any>>;
  value: IAnimalCapture;
}

const CaptureAnimalFormContent = ({ name, index, setFieldValue, value }: CaptureAnimalFormContentProps) => {
  const renderCaptureFields = (): JSX.Element => {
    return (
      <>
        <Grid item xs={6}>
          <CustomTextField
            other={{ required: true, size: 'small' }}
            label="Temp Capture Timestamp"
            name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
          />
        </Grid>
        <Grid item />
        <Grid item xs={6}>
          <TextInputToggle label="Add comment about this Capture">
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Capture Coordinate Uncertainty"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_coordinate_uncertainty', index)}
            />
          </TextInputToggle>
        </Grid>
      </>
    );
  };

  const renderReleaseFields = (): JSX.Element => {
    return (
      <>
        <Grid item xs={6}>
          <CustomTextField
            other={{ required: true, size: 'small' }}
            label="Temp Release Timestamp"
            name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
          />
        </Grid>
        <Grid item />
        <Grid item xs={6}>
          <TextInputToggle label="Add comment about this Release">
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Release Comment"
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_comment', index)}
            />
          </TextInputToggle>
        </Grid>
      </>
    );
  };

  return (
    <LocationEntryForm
      name={name}
      index={index}
      setFieldValue={setFieldValue}
      value={value}
      primaryLocationFields={{
        latitude: 'capture_latitude',
        longitude: 'capture_longitude',
        coordinate_uncertainty: 'capture_coordinate_uncertainty',
        utm_northing: 'capture_utm_northing',
        utm_easting: 'capture_utm_easting'
      }}
      secondaryLocationFields={{
        latitude: 'release_latitude',
        longitude: 'release_longitude',
        coordinate_uncertainty: 'release_coordinate_uncertainty',
        utm_northing: 'release_utm_northing',
        utm_easting: 'release_utm_easting'
      }}
      secondaryCheckboxLabel={SurveyAnimalsI18N.animalCaptureReleaseRadio}
      otherPrimaryFields={[renderCaptureFields()]}
      otherSecondaryFields={[renderReleaseFields()]}
    />
  );
};

export default CaptureAnimalForm;
