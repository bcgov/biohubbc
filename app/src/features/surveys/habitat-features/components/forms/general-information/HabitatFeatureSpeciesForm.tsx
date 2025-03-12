import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { FieldArray, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useEffect, useRef } from 'react';
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
  const biohubApi = useBiohubApi();

  const formikProps = useFormikContext<HabitatFeatureFormValuesType>();

  const taxonDataLoader = useDataLoader(async (tsns: number[]) => {
    if (!tsns.length) {
      return [];
    }

    return biohubApi.taxonomy.getSpeciesFromIds(tsns);
  });

  // Ref to cache the current and newly selected taxons (tsn -> taxon)
  const taxonCache = useRef(new Map<number, ITaxonomy | IPartialTaxonomy>());

  useEffect(() => {
    /**
     * Load taxons from the API and cache them.
     *
     * @returns {Promise<void>}
     */
    const loadTaxons = async (): Promise<void> => {
      if (taxonDataLoader.hasLoaded) {
        return;
      }

      const tsns = formikProps.initialValues.survey_habitat_feature_taxons.map((taxon) => taxon.itis_tsn);

      const taxons = await taxonDataLoader.load(tsns);

      // nothing to cache
      if (!taxons) {
        return;
      }

      // cache the taxons
      for (const taxon of taxons) {
        taxonCache.current.set(taxon.tsn, taxon);
      }
    };

    loadTaxons();
  }, [formikProps.initialValues.survey_habitat_feature_taxons, taxonDataLoader]);

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
                const cachedTaxon = taxonCache.current.get(taxon.itis_tsn) ?? {
                  tsn: taxon.itis_tsn,
                  scientificName: taxon.itis_scientific_name,
                  commonNames: []
                };

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
