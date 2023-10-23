import { Box, Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Fragment, useEffect } from 'react';
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

interface IMarkingAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
}

export const MarkingAnimalFormContent = ({ name, index }: IMarkingAnimalFormContentProps) => {
  const { values, errors, handleBlur } = useFormikContext<IAnimal>();

  return (
    <Fragment>
      <Grid item xs={12} md={6}>
        <CbSelectField
          label="Marking Type"
          name={getAnimalFieldName<IAnimalMarking>(name, 'marking_type_id', index)}
          id="marking_type"
          route="lookups/marking-types"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'marking_type_id')
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CbSelectField
          label="Marking Body Location"
          name={getAnimalFieldName<IAnimalMarking>(name, 'taxon_marking_body_location_id', index)}
          id="marking_body_location"
          route="xref/taxon-marking-body-locations"
          query={`taxon_id=${values.general.taxon_id}`}
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'taxon_marking_body_location_id')
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CbSelectField
          label="Primary Colour"
          name={getAnimalFieldName<IAnimalMarking>(name, 'primary_colour_id', index)}
          id="primary_colour_id"
          route="lookups/colours"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'primary_colour_id')
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CbSelectField
          label="Secondary Colour"
          name={getAnimalFieldName<IAnimalMarking>(name, 'secondary_colour_id', index)}
          id="secondary_colour_id"
          route="lookups/colours"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'secondary_colour_id')
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Marking')}>
          <CustomTextField
            label="Marking Comment"
            name={getAnimalFieldName<IAnimalMarking>(name, 'marking_comment', index)}
            other={{ size: 'medium', required: isRequiredInSchema(AnimalMarkingSchema, 'marking_comment') }}
            handleBlur={handleBlur}
          />
        </TextInputToggle>
      </Grid>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
    </Fragment>
  );
};

const MarkingAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();
  const { data: bodyLocations, load, refresh } = useDataLoader(api.lookup.getTaxonMarkingBodyLocations);

  if (values.general.taxon_id) {
    load(values.general.taxon_id);
  }

  useEffect(() => {
    refresh(values.general.taxon_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.general.taxon_id]);

  const name: keyof IAnimal = 'markings';
  const newMarking: IAnimalMarking = {
    _id: v4(),

    marking_type_id: '',
    taxon_marking_body_location_id: '',
    primary_colour_id: '',
    secondary_colour_id: '',
    marking_comment: '',
    marking_id: undefined
  };

  return (
    <Box id={'marking-animal-form'}>
      <FieldArray name={name}>
        {({ remove, push }: FieldArrayRenderProps) => (
          <>
            <FormSectionWrapper
              title={SurveyAnimalsI18N.animalMarkingTitle}
              addedSectionTitle={SurveyAnimalsI18N.animalMarkingTitle2}
              titleHelp={SurveyAnimalsI18N.animalMarkingHelp}
              btnLabel={SurveyAnimalsI18N.animalMarkingAddBtn}
              disableAddBtn={!bodyLocations?.length || !lastAnimalValueValid('markings', values)}
              handleAddSection={() => push(newMarking)}
              handleRemoveSection={remove}>
              {values?.markings?.map((mark, index) => (
                <MarkingAnimalFormContent key={mark._id} name="markings" index={index} />
              ))}
            </FormSectionWrapper>
          </>
        )}
      </FieldArray>
    </Box>
  );
};

export default MarkingAnimalForm;
