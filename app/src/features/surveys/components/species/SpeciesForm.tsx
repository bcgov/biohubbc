import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import yup from 'utils/YupSchema';
import FocalSpeciesComponent from './components/FocalSpeciesComponent';

export type PostCollectionUnit = {
  critterbase_collection_category_id: string;
  critterbase_collection_unit_id: string;
};

export interface ITaxonomyWithEcologicalUnits extends IPartialTaxonomy {
  ecological_units: PostCollectionUnit[];
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
          ecological_units: yup
            .array()
            .of(
              yup.object().shape({
                critterbase_collection_category_id: yup
                  .string()
                  .test(
                    'is-unique-ecological-unit',
                    'Ecological unit must be unique',
                    function (collection_category_id) {
                      const formValues = this.options.context;

                      if (!formValues?.ecological_units?.length) {
                        return true;
                      }

                      return (
                        formValues.ecological_units.filter(
                          (ecologicalUnit: PostCollectionUnit) =>
                            ecologicalUnit.critterbase_collection_category_id === collection_category_id
                        ).length <= 1
                      );
                    }
                  )
                  .required('Ecological unit is required')
                  .nullable(),
                critterbase_collection_unit_id: yup.string().when('critterbase_collection_category_id', {
                  is: (critterbase_collection_category_id: string) => critterbase_collection_category_id !== null,
                  then: yup.string().required('Ecological unit is required').nullable(),
                  otherwise: yup.string().nullable()
                })
              })
            )
            .nullable()
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
          <FocalSpeciesComponent />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeciesForm;
