import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';

export interface ITaxonomyDataGridCellProps<T extends GridValidRowModel> {
  dataGridProps: GridRenderEditCellParams<T>;
}

/**
 * Renders a data grid cell for a taxonomy value.
 *
 * Translates the raw taxonomy id into a human readable string.
 *
 * @template T
 * @param {ITaxonomyDataGridCellProps<T>} props
 * @return {*}
 */
const TaxonomyDataGridCell = <T extends GridValidRowModel>(props: ITaxonomyDataGridCellProps<T>) => {
  const { dataGridProps } = props;

  const biohubApi = useBiohubApi();

  const taxonomyDataLoader = useDataLoader(() => biohubApi.taxonomy.getSpeciesFromIds([Number(dataGridProps.value)]));

  taxonomyDataLoader.load();

  if (!taxonomyDataLoader.isReady) {
    return null;
  }

  if (taxonomyDataLoader.data?.searchResponse?.length !== 1) {
    return null;
  }

  return <>{taxonomyDataLoader.data?.searchResponse[0].label}</>;
};

export default TaxonomyDataGridCell;
