import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { EcologicalUnitsSelect } from 'components/species/ecological-units/EcologicalUnitsSelect';
import { initialEcologicalUnitValues } from 'features/surveys/animals/animal-form/components/ecological-units/EcologicalUnitsForm';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useEffect } from 'react';
import { isDefined } from 'utils/Utils';
import { v4 } from 'uuid';

export interface ISelectedSpeciesProps {
  /**
   * The species to display.
   *
   * @type {IPartialTaxonomy}
   * @memberof ISelectedSpeciesProps
   */
  species: IPartialTaxonomy;
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof ISelectedSpeciesProps
   */
  index: number;
}

/**
 * Renders form controls for selecting ecological units for a focal species.
 *
 * @param {ISelectedSpeciesProps} props
 * @return {*}
 */
export const FocalSpeciesEcologicalUnitsForm = (props: ISelectedSpeciesProps) => {
  const { index, species } = props;

  const { values } = useFormikContext<IEditSurveyRequest | ICreateSurveyRequest>();

  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTsnCollectionCategories(tsn));

  useEffect(() => {
    ecologicalUnitDataLoader.load(species.tsn);
  }, [ecologicalUnitDataLoader, species.tsn]);

  const ecologicalUnitsForSpecies = ecologicalUnitDataLoader.data ?? [];

  const selectedUnits =
    values.species.focal_species.filter((item) => item.tsn === species.tsn).flatMap((item) => item.ecological_units) ??
    [];

  return (
    <FieldArray
      name={`species.focal_species.[${index}].ecological_units`}
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <Stack gap={2}>
          {selectedUnits.map((ecological_unit, ecologicalUnitIndex) => (
            <EcologicalUnitsSelect
              key={ecological_unit.critterbase_collection_category_id ?? v4()}
              categoryFieldName={`species.focal_species.[${index}].ecological_units[${ecologicalUnitIndex}].critterbase_collection_category_id`}
              unitFieldName={`species.focal_species.[${index}].ecological_units[${ecologicalUnitIndex}].critterbase_collection_unit_id`}
              selectedCategoryIds={values.species.focal_species[index].ecological_units
                .map((unit) => unit.critterbase_collection_category_id)
                .filter(isDefined)}
              ecologicalUnits={ecologicalUnitsForSpecies}
              arrayHelpers={arrayHelpers}
              index={ecologicalUnitIndex}
            />
          ))}
          <Box>
            <Button
              color="primary"
              variant="outlined"
              data-testid="ecological-unit-button"
              onClick={() => arrayHelpers.push(initialEcologicalUnitValues)}
              startIcon={<Icon path={mdiPlus} size={0.75} />}
              aria-label="Add Ecological Unit"
              disabled={!(ecologicalUnitsForSpecies.length && selectedUnits.length < ecologicalUnitsForSpecies.length)}
              sx={{ textTransform: 'uppercase' }}>
              Add Ecological Unit
            </Button>
          </Box>
        </Stack>
      )}
    />
  );
};
