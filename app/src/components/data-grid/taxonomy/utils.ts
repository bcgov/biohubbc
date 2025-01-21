import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridTaxonomyOption } from 'components/data-grid/taxonomy/TaxonomyDataGrid.interface';
import { ITaxonomyContext } from 'contexts/taxonomyContext';

/**
 * Get the currently selected taxon for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {ITaxonomyContext} taxonomyContext
 * @return {*}  {(IAutocompleteDataGridTaxonomyOption | null)}
 */
export const getCurrentTaxon = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  taxonomyContext: ITaxonomyContext
): IAutocompleteDataGridTaxonomyOption | null => {
  let taxonId = dataGridProps.value;

  if (!taxonId) {
    return null;
  }

  taxonId = Number(dataGridProps.value);

  if (isNaN(taxonId)) {
    return null;
  }

  const response = taxonomyContext.getCachedSpeciesTaxonomyById(taxonId);

  if (!response) {
    return null;
  }

  const partialTaxon = taxonomyContext.getCachedSpeciesTaxonomyById(taxonId) ?? null;

  if (!partialTaxon) {
    return null;
  }

  // Format the response to match the expected format for the autocomplete
  return {
    commonNames: partialTaxon.commonNames,
    tsn: partialTaxon.tsn,
    scientificName: partialTaxon.scientificName,
    rank: partialTaxon.rank,
    kingdom: partialTaxon.kingdom,
    // Autocomplete properties
    value: partialTaxon.tsn,
    label: partialTaxon.scientificName
  };
};

/**
 * Get array of taxons for the currently selected taxon.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {ITaxonomyContext} taxonomyContext
 * @return {*}  {IAutocompleteDataGridTaxonomyOption[]}
 */
export const getTaxonsForRow = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  taxonomyContext: ITaxonomyContext
): IAutocompleteDataGridTaxonomyOption[] => {
  const currentTaxon = getCurrentTaxon(dataGridProps, taxonomyContext);

  if (!currentTaxon) {
    return [];
  }

  return [currentTaxon];
};
