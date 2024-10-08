import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollectionCategory } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_ECOLOGICAL_UNIT_LABEL = 'Ecological Unit Option';

interface IEcologicalUnitSelectProps {
  /**
   * The ecological categories to display in the category field.
   * @type {ICollectionCategory[]}
   */
  ecologicalCategories: ICollectionCategory[];
  /**
   * The category ids to filter from the autocomplete options. Excludes the current category.
   *
   * Note: Useful if needing to render multiple `EcologicalUnitDualSelect` components
   * while preventing duplicate categories from being selected.
   *
   * @type {string[]}
   */
  filterCategoryIds?: string[];
  /**
   * The unit ids to filter from the autocomplete options. Excludes the current unit.
   *
   * Note: Useful if needing to render multiple `EcologicalUnitDualSelect` components
   * while preventing duplicate units from being selected.
   *
   * @type {string[]}
   */
  filterUnitIds?: string[];
  /**
   * The formik field name for the category.
   * @type {string}
   */
  formikCategoryFieldName: string;
  /**
   * The formik field name for the unit.
   * @type {string}
   */
  formikUnitFieldName: string;

  /**
   * Callback for when the delete button is clicked.
   * @type {() => void}
   */
  onDelete: () => void;
}

/**
 * Returns a pair of autocomplete fields for selecting an ecological category and unit (option).
 *
 * @param props {IEcologicalUnitsSelectProps}
 * @returns
 */
export const EcologicalUnitDualSelect = (props: IEcologicalUnitSelectProps) => {
  const formik = useFormikContext();
  const critterbaseApi = useCritterbaseApi();

  // State for the ecological unit label - displays the currently selected category name
  const [ecologicalUnitLabel, setEcologicalUnitLabel] = useState<string>(DEFAULT_ECOLOGICAL_UNIT_LABEL);

  const ecologicalUnitOptionsLoader = useDataLoader((categoryId: string) =>
    critterbaseApi.xref.getCollectionUnits(categoryId)
  );

  // Get the current ecological unit / category id from the formik values
  const ecologicalUnitId: string | null = get(formik.values, props.formikUnitFieldName);
  const ecologicalCategoryId: string | null = get(formik.values, props.formikCategoryFieldName);

  // Filter out categories that are already selected (if included in filterCategoryIds)
  const filteredEcologicalCategories = useMemo(() => {
    const filterCategoryIdsSet = new Set(props.filterCategoryIds ?? []);

    return props.ecologicalCategories
      .map((category) => ({
        value: category.collection_category_id,
        label: category.category_name
      }))
      .filter(
        (category) =>
          (ecologicalCategoryId && filterCategoryIdsSet.has(ecologicalCategoryId)) ||
          !filterCategoryIdsSet.has(category.value)
      );
  }, [ecologicalCategoryId, props.ecologicalCategories, props.filterCategoryIds]);

  // Filter out units that are already selected (if included in filterUnitIds)
  const filteredEcologicalUnits = useMemo(() => {
    // Only show options if a category is selected and there are options to show
    if (!ecologicalCategoryId || !ecologicalUnitOptionsLoader.data?.length) {
      return [];
    }

    const filterUnitIdsSet = new Set(props.filterUnitIds ?? []);

    return (
      ecologicalUnitOptionsLoader.data
        .map((unit) => ({
          value: unit.collection_unit_id,
          label: unit.unit_name
        }))
        // Filter out units that are already selected (if included in filterUnitIds)
        .filter(
          (unit) => (ecologicalUnitId && filterUnitIdsSet.has(ecologicalUnitId)) || !filterUnitIdsSet.has(unit.value)
        )
    );
  }, [ecologicalCategoryId, ecologicalUnitId, ecologicalUnitOptionsLoader.data, props.filterUnitIds]);

  useEffect(() => {
    if (!ecologicalCategoryId) {
      return;
    }
    // Refresh the ecological unit options when the selected category changes
    ecologicalUnitOptionsLoader.refresh(ecologicalCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ecologicalCategoryId]);

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={props.formikCategoryFieldName}
        name={props.formikCategoryFieldName}
        label="Ecological Unit"
        options={filteredEcologicalCategories}
        onChange={(_, option) => {
          // Clear the unit field if no category is selected
          if (!option) {
            formik.setFieldValue(props.formikUnitFieldName, undefined);
            setEcologicalUnitLabel(DEFAULT_ECOLOGICAL_UNIT_LABEL);
            return;
          }

          // Set the category field value
          formik.setFieldValue(props.formikCategoryFieldName, option.value);
          // Set the ecological unit label
          setEcologicalUnitLabel(option.label);
        }}
        required
        disabled={Boolean(!filteredEcologicalCategories.length)}
        sx={{ flex: '1 1 auto' }}
      />

      <AutocompleteField
        id={props.formikUnitFieldName}
        name={props.formikUnitFieldName}
        label={ecologicalUnitLabel ?? 'Ecological Unit Option'}
        options={filteredEcologicalUnits}
        disabled={Boolean(!filteredEcologicalUnits.length)}
        required
        onChange={(_, option) => {
          formik.setFieldValue(props.formikUnitFieldName, option?.value ?? undefined);
        }}
        sx={{
          flex: '1 1 auto'
        }}
      />

      <IconButton
        data-testid={`ecological-unit-delete-button`}
        title="Remove Ecological Unit"
        aria-label="Remove Ecological Unit"
        onClick={props.onDelete}
        sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
