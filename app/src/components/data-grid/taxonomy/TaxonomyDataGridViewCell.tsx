import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { useContext } from 'react';

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

  const taxonomyContext = useContext(TaxonomyContext);

  const response = 
  taxonomyContext.getSpeciesTaxonomyById(dataGridProps.value);
  /*
  useMemo(
    () => taxonomyContext.getSpeciesTaxonomyById(dataGridProps.value),
    [taxonomyContext.getSpeciesTaxonomyById]
  );
  */

  if (!dataGridProps.value) {
    return null;
  }

  if (!response) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      component="div"
      sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      {response.label}
    </Typography>
  );
};

export default TaxonomyDataGridViewCell;
