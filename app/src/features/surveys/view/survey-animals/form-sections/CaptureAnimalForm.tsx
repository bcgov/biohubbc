import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import AddSectionBtn from '../AddSectionBtn';
import { IAnimal } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

const CaptureAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'capture';
  return (
    <FieldArray name={name}>
      {({ insert, remove, push }: FieldArrayRenderProps) => (
        <>
          {values.capture.length > 0 &&
            values.capture.map((cap, index) => (
              <FormSectionWrapper key={`capture-${index}`} title={`Capture ${index}`} titleHelp="Capture Help">
                <CustomTextField
                  other={{ size: 'small' }}
                  label="Latitude"
                  name={`${name}.${index}.capture_latitude`}
                />
                <CustomTextField
                  other={{ size: 'small' }}
                  label="Longitude"
                  name={`${name}.${index}.capture_longitude`}
                />
              </FormSectionWrapper>
            ))}
          <AddSectionBtn handleAdd={() => push({})} label="Add Capture" />
        </>
      )}
    </FieldArray>
  );
};

export default CaptureAnimalForm;
