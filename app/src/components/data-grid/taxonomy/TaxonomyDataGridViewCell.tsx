import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';

export interface ITaxonomyDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {ITaxonomyDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
const TaxonomyDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: ITaxonomyDataGridViewCellProps<DataGridType>
) => {
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

export default TaxonomyDataGridViewCell;
