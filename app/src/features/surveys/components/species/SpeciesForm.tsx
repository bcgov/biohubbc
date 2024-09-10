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
      .test('is-unique-ecological-unit', 'Ecological units must be unique', function () {
        const focalSpecies = (this.options.context?.species.focal_species ?? []) as ITaxonomyWithEcologicalUnits[];

        const seenCollectionUnitIts = new Set<string | null>();

        for (const focalSpeciesItem of focalSpecies) {
          for (const ecologicalUnit of focalSpeciesItem.ecological_units) {
            if (seenCollectionUnitIts.has(ecologicalUnit.critterbase_collection_category_id)) {
              // Duplicate ecological collection category id found, return false
              return false;
            }
            seenCollectionUnitIts.add(ecologicalUnit.critterbase_collection_category_id);
          }
        }

        // Valid, return true
        return true;
      })
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
