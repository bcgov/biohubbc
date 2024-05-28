import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import React from 'react';

export interface ITechniqueGeneralInformationForm {
  survey_details: {
    survey_name: string;
    start_date: string;
    end_date: string;
    progress_id: number | null;
    survey_types: number[];
    revision_count: number;
  };
  species: {
    focal_species: ITaxonomy[];
    ancillary_species: ITaxonomy[];
  };
  permit: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
}

export interface ITechniqueGeneralInformationFormProps {}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const TechniqueGeneralInformationForm: React.FC<ITechniqueGeneralInformationFormProps> = () => {
  const formikProps = useFormikContext<ITechniqueGeneralInformationForm>();

  console.log(formikProps);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="name"
            label="Technique Name"
            maxLength={64}
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="method_lookup_id"
            label="Type"
            maxLength={1000}
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="description"
            label="Description"
            maxLength={1000}
            other={{
              multiline: true,
              rows: 4
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TechniqueGeneralInformationForm;
