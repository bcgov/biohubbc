import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import { AnimalFormValues } from '../IndividualAnimalForm';
import { IAnimal } from '../useAnimalFormData';
import FormSectionWrapper from './FormSectionWrapper';

const CaptureAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  const name: keyof typeof AnimalFormValues = 'capture';
  return (
    <FieldArray name={name}>
      {({ insert, remove, push }: FieldArrayRenderProps) => (
        <>
          {values.capture.length > 0 &&
            values.capture.map((cap, index) => (
              <FormSectionWrapper
                key={`capture-${index}`}
                title={`Capture ${index}`}
                btnText="Add Capture"
                handleBtnClick={() => push(AnimalFormValues.capture[0])}
                titleHelp="Capture Help">
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
        </>
      )}
    </FieldArray>
  );
};

export default CaptureAnimalForm;
