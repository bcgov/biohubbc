import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMarking } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const MarkingAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'marking';
  const newMarking: IAnimalMarking = {
    marking_type_id: '',
    marking_body_location_id: '',
    primary_colour_id: '',
    secondary_colour_id: '',
    marking_comment: ''
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={'Marking'}
            titleHelp={'help'}
            btnLabel={'Add Marking'}
            handleAddSection={() => push(newMarking)}
            handleRemoveSection={remove}>
            {values.marking.map((_cap, index) => (
              <Fragment key={`marking-inputs-${index}`}>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Marking Type"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'marking_type_id', index)}
                    id="marking_type"
                    route="marking_type"
                    controlProps={{ size: 'small', required: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Marking Body Location"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'marking_body_location_id', index)}
                    id="marking_body_location"
                    route="colours"
                    controlProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Primary Colour"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'primary_colour_id', index)}
                    id="primary_colour_id"
                    route="colours"
                    controlProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Secondary Colour"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'secondary_colour_id', index)}
                    id="secondary_colour_id"
                    route="colours"
                    controlProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextInputToggle label="Add comment about this Marking">
                    <CustomTextField
                      other={{ size: 'small' }}
                      label="Marking Comment"
                      name={getAnimalFieldName<IAnimalMarking>(name, 'marking_comment', index)}
                    />
                  </TextInputToggle>
                </Grid>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default MarkingAnimalForm;
