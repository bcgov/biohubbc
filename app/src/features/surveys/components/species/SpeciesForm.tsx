import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FocalSpeciesComponent from 'components/species/FocalSpeciesComponent';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import yup from 'utils/YupSchema';

export interface ISpeciesForm {
  species: {
    focal_species: IPartialTaxonomy[];
  };
}

export const SpeciesInitialValues: ISpeciesForm = {
  species: {
    focal_species: []
  }
};

export const SpeciesYupSchema = yup.object().shape({
  species: yup.object().shape({
    focal_species: yup.array().min(1, 'You must specify a focal species').required('Required')
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
          <FocalSpeciesComponent />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeciesForm;