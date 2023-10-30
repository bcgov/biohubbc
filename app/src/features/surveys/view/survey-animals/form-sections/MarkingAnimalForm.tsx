import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { Fragment } from 'react';
import { AnimalMarkingSchema, getAnimalFieldName, IAnimal, IAnimalMarking, isRequiredInSchema } from '../animal';

/**
 * Renders the Marking section for the Individual Animal form
 *
 * @return {*}
 */

interface IMarkingAnimalFormContentProps {
  index: number;
}

export const MarkingAnimalFormContent = ({ index }: IMarkingAnimalFormContentProps) => {
  const name: keyof IAnimal = 'markings';

  const { values, handleBlur, setFieldValue } = useFormikContext<IAnimal>();

  const handlePrimaryColourName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'primary_colour', index), label);
  };

  const handleMarkingTypeName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'marking_type', index), label);
  };

  const handleMarkingLocationName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMarking>(name, 'body_location', index), label);
  };

  return (
    <Fragment>
      <Grid item xs={12} md={12}>
        <CbSelectField
          label="Marking Type"
          name={getAnimalFieldName<IAnimalMarking>(name, 'marking_type_id', index)}
          id="marking_type"
          route="lookups/marking-types"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'marking_type_id')
          }}
          handleChangeSideEffect={handleMarkingTypeName}
        />
      </Grid>
      <Grid item xs={12} md={12}>
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
          handleChangeSideEffect={handleMarkingLocationName}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <CbSelectField
          label="Primary Colour"
          name={getAnimalFieldName<IAnimalMarking>(name, 'primary_colour_id', index)}
          id="primary_colour_id"
          route="lookups/colours"
          controlProps={{
            size: 'medium',
            required: isRequiredInSchema(AnimalMarkingSchema, 'primary_colour_id')
          }}
          handleChangeSideEffect={handlePrimaryColourName}
        />
      </Grid>
      <Grid item xs={12} md={12}>
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
        <CustomTextField
          label="Marking Comment"
          name={getAnimalFieldName<IAnimalMarking>(name, 'marking_comment', index)}
          other={{ size: 'medium', required: isRequiredInSchema(AnimalMarkingSchema, 'marking_comment') }}
          handleBlur={handleBlur}
        />
      </Grid>
    </Fragment>
  );
};

export default MarkingAnimalFormContent;
