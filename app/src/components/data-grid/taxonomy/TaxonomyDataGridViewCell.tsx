import Typography from '@mui/material/Typography';
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

  const taxonomyDataLoader = useDataLoader(async () => {
    if (!dataGridProps.value) {
      return { searchResponse: [] };
    }

    const id = Number(dataGridProps.value);

    if (isNaN(id)) {
      return { searchResponse: [] };
    }

    return biohubApi.taxonomy.getSpeciesFromIds([Number(dataGridProps.value)]);
  });

  taxonomyDataLoader.load();

  if (!taxonomyDataLoader.isReady) {
    return null;
  }

  if (taxonomyDataLoader.data?.searchResponse?.length !== 1) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      component="div"
      sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      {taxonomyDataLoader.data?.searchResponse[0].label}
    </Typography>
  );
};

export default TaxonomyDataGridViewCell;
