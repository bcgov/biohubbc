import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { useCodesContext } from 'hooks/useContext';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import React, { useEffect } from 'react';

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
  const codesContext = useCodesContext();

  const methodOptions: ISelectWithSubtextFieldOption[] =
    codesContext.codesDataLoader.data?.sample_methods.map((option) => ({
      value: option.id,
      label: option.name,
      subText: option.description
    })) ?? [];

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

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
          <SelectWithSubtextField
            id="method_lookup_id"
            label="Sampling Technique"
            name="method_lookup_id"
            options={methodOptions}
            required
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
        <Grid item xs={12}>
          <CustomTextField name="distance_threshold" label="Distance threshold" maxLength={100} />
        </Grid>
      </Grid>
    </>
  );
};

export default TechniqueGeneralInformationForm;
