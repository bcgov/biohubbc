import { Collapse, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { FieldArray, useFormikContext } from 'formik';
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useRef } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { CreateHabitatFeatureFormValues, UpdateHabitatFeatureFormValues } from '../HabitatFeatureFormContainer';

/**
 * Form control for selecting species associated with a habitat feature.
 *
 * @returns {*} {JSX.Element}
 */
export const HabitatFeatureSpeciesForm = <
  HabitatFeatureFormValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(): JSX.Element => {
  const formikProps = useFormikContext<HabitatFeatureFormValuesType>();
  // Caches selected taxons (tsn -> taxon)
  const taxonCache = useRef(new Map<number, ITaxonomy | IPartialTaxonomy>());

  return (
    <FieldArray
      name="survey_habitat_feature_taxons"
      render={(arrayHelpers) => {
        return (
          <>
            <SpeciesAutocompleteField
              formikFieldName={'survey_habitat_feature_taxons'}
              label={'Species association'}
              helpText={'The species associated with the habitat feature ie: "Bald Eagle" nest'}
              clearOnSelect={true}
              required={false}
              handleSpecies={(taxon) => {
                taxonCache.current.set(taxon.tsn, taxon);

                // Push the selected taxon into the formik array state
                arrayHelpers.push({
                  itis_tsn: taxon.tsn,
                  itis_scientific_name: taxon.scientificName,
                  comment: null // TODO: Add form control for comment
                });
              }}
            />
            <TransitionGroup>
              {formikProps.values.survey_habitat_feature_taxons.map((taxon, index) => {
                const cachedTaxon = taxonCache.current.get(taxon.itis_tsn);

                if (!cachedTaxon) {
                  throw new Error('Invalid taxon cache: HabitatFeaturesSpeciesForm');
                }

                return (
                  <Collapse key={taxon.itis_tsn}>
                    <Paper variant="outlined" sx={{ px: 3, py: 2, mt: 1, background: grey[50] }}>
                      <SpeciesSelectedCard
                        species={cachedTaxon}
                        index={index}
                        handleRemove={() => {
                          arrayHelpers.remove(index);
                          taxonCache.current.delete(taxon.itis_tsn);
                        }}
                      />
                    </Paper>
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </>
        );
      }}
    />
  );
};
