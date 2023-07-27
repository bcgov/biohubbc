import { Grid } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { IAnimal, IAnimalCapture } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

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

const CaptureAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'capture';
  const newCapture: IAnimalCapture = {
    capture_latitude: '' as unknown as number,
    capture_longitude: '' as unknown as number,
    capture_comment: '',
    capture_timestamp: '' as unknown as Date,
    release_latitude: '' as unknown as number,
    release_longitude: '' as unknown as number,
    release_comment: '',
    release_timestamp: '' as unknown as Date
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
              <Fragment key={`${name}-${index}-inputs`}>
                <Grid item xs={6}>
                  <CustomTextField
                    other={{ required: true, size: 'small' }}
                    label="Latitude"
                    name={`${name}.${index}.capture_latitude`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    other={{ required: true, size: 'small' }}
                    label="Longitude"
                    name={`${name}.${index}.capture_longitude`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    other={{ required: true, size: 'small' }}
                    label="Temp Capture Timestamp"
                    name={`${name}.${index}.capture_timestamp`}
                  />
                </Grid>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default CaptureAnimalForm;
