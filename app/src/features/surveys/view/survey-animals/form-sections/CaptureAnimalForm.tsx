import { Grid } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { v4 } from 'uuid';
import {
  AnimalCaptureSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalCapture,
  isRequiredInSchema,
  lastAnimalValueValid
} from '../animal';
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
  const { values } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'captures';
  const newCapture: IAnimalCapture = {
    _id: v4(),

    capture_latitude: '' as unknown as number,
    capture_longitude: '' as unknown as number,
    capture_utm_northing: '' as unknown as number,
    capture_utm_easting: '' as unknown as number,
    capture_comment: undefined,
    capture_coordinate_uncertainty: 10,
    capture_timestamp: '' as unknown as Date,
    projection_mode: 'wgs' as ProjectionMode,
    release_latitude: undefined,
    release_longitude: undefined,
    release_utm_northing: undefined,
    release_utm_easting: undefined,
    release_comment: undefined,
    release_timestamp: undefined,
    release_coordinate_uncertainty: undefined
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCaptureTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalCaptureTitle2}
            titleHelp={SurveyAnimalsI18N.animalCaptureHelp}
            btnLabel={SurveyAnimalsI18N.animalCaptureAddBtn}
            disableAddBtn={!lastAnimalValueValid('captures', values)}
            handleAddSection={() => push(newCapture)}
            handleRemoveSection={remove}>
            {values.captures.map((cap, index) => (
              <CaptureAnimalFormContent key={cap._id} name={name} index={index} value={cap} />
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
  value: IAnimalCapture;
}

const CaptureAnimalFormContent = ({ name, index, value }: CaptureAnimalFormContentProps) => {
  const { setFieldValue } = useFormikContext<IAnimal>();

  const renderCaptureFields = (): JSX.Element => {
    return (
      <Fragment key={'capture-fields'}>
        <Grid item xs={6}>
          <CustomTextField
            other={{
              required: isRequiredInSchema(AnimalCaptureSchema, 'capture_timestamp'),
              size: 'small',
              type: 'date',
              InputLabelProps: { shrink: true }
            }}
            label="Capture Date"
            name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInputToggle label="Add comment about this Capture">
            <CustomTextField
              other={{ size: 'small', required: isRequiredInSchema(AnimalCaptureSchema, 'capture_comment') }}
              label="Capture Comment"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_comment', index)}
            />
          </TextInputToggle>
        </Grid>
      </Fragment>
    );
  };

  const renderReleaseFields = (): JSX.Element => {
    return (
      <Fragment key={`capture-release-fields`}>
        <Grid item xs={6}>
          <CustomTextField
            other={{
              required: isRequiredInSchema(AnimalCaptureSchema, 'release_timestamp'),
              size: 'small',
              type: 'date',
              InputLabelProps: { shrink: true }
            }}
            label="Release Date"
            name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInputToggle label="Add comment about this Release">
            <CustomTextField
              other={{ size: 'small', required: isRequiredInSchema(AnimalCaptureSchema, 'release_comment') }}
              label="Release Comment"
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_comment', index)}
            />
          </TextInputToggle>
        </Grid>
      </Fragment>
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
