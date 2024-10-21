import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FocalSpeciesForm } from 'features/surveys/components/species/components/FocalSpeciesForm';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import yup from 'utils/YupSchema';

export type IEcologicalUnit = {
  critterbase_collection_category_id: string | null;
  critterbase_collection_unit_id: string | null;
};

export const EcologicalUnitInitialValues: IEcologicalUnit = {
  critterbase_collection_category_id: null,
  critterbase_collection_unit_id: null
};

export interface ITaxonomyWithEcologicalUnits extends IPartialTaxonomy {
  ecological_units: IEcologicalUnit[];
}

export interface ISpeciesForm {
  species: {
    focal_species: ITaxonomyWithEcologicalUnits[];
  };
}

export const SpeciesInitialValues: ISpeciesForm = {
  species: {
    focal_species: []
  }
};

export const SpeciesYupSchema = yup.object().shape({
  species: yup.object().shape({
    focal_species: yup
      .array()
      .of(
        yup.object().shape({
          ecological_units: yup.array().of(
            yup.object().shape({
              critterbase_collection_category_id: yup.string().nullable().required('Ecological unit is required'),
              critterbase_collection_unit_id: yup.string().nullable().required('Ecological unit is required')
            })
          )
        })
      )
      .min(1, 'You must specify a focal species')
      .required('Required')
  })
});

/**
 * Create survey - species information fields
 *
 * @return {*}
 */
const SpeciesForm = () => {
  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FocalSpeciesForm />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeciesForm;
