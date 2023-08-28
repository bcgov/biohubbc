import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { v4 } from 'uuid';
import {
  AnimalMarkingSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalMarking,
  isRequiredInSchema,
  lastAnimalValueValid
} from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

/**
 * Renders the Marking section for the Individual Animal form
 *
 * @return {*}
 */

const MarkingAnimalForm = () => {
  const { values, handleBlur } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'markings';
  const newMarking: IAnimalMarking = {
    _id: v4(),

    marking_type_id: '',
    taxon_marking_body_location_id: '',
    primary_colour_id: '',
    secondary_colour_id: '',
    marking_comment: ''
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMarkingTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalMarkingTitle2}
            titleHelp={SurveyAnimalsI18N.animalMarkingHelp}
            btnLabel={SurveyAnimalsI18N.animalMarkingAddBtn}
            disableAddBtn={!lastAnimalValueValid('markings', values)}
            handleAddSection={() => push(newMarking)}
            handleRemoveSection={remove}>
            {values?.markings?.map((mark, index) => (
              <Fragment key={mark._id}>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Marking Type"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'marking_type_id', index)}
                    id="marking_type"
                    route="lookups/marking-types"
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalMarkingSchema, 'marking_type_id')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Marking Body Location"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'taxon_marking_body_location_id', index)}
                    id="marking_body_location"
                    route="xref/taxon-marking-body-locations"
                    query={`taxon_id=${values.general.taxon_id}`}
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalMarkingSchema, 'taxon_marking_body_location_id')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Primary Colour"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'primary_colour_id', index)}
                    id="primary_colour_id"
                    route="lookups/colours"
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalMarkingSchema, 'primary_colour_id')
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Secondary Colour"
                    name={getAnimalFieldName<IAnimalMarking>(name, 'secondary_colour_id', index)}
                    id="secondary_colour_id"
                    route="lookups/colours"
                    controlProps={{
                      size: 'small',
                      required: isRequiredInSchema(AnimalMarkingSchema, 'secondary_colour_id')
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Marking')}>
                    <CustomTextField
                      label="Marking Comment"
                      name={getAnimalFieldName<IAnimalMarking>(name, 'marking_comment', index)}
                      other={{ size: 'small', required: isRequiredInSchema(AnimalMarkingSchema, 'marking_comment') }}
                      handleBlur={handleBlur}
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
