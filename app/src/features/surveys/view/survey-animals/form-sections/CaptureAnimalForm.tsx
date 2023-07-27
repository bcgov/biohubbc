import { Grid } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { IAnimal, IAnimalCapture } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

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
      {({ insert, remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={`Capture`}
            titleHelp="Capture Help"
            btnLabel="Add Capture Event"
            handleAddSection={() => push(newCapture)}>
            {values.capture.map((cap, index) => (
              <Fragment key={`${name}-${index}-inputs`}>
                <Grid item xs={6}>
                  <CustomTextField
                    other={{ size: 'small' }}
                    label="Latitude"
                    name={`${name}.${index}.capture_latitude`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    other={{ size: 'small' }}
                    label="Longitude"
                    name={`${name}.${index}.capture_longitude`}
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
