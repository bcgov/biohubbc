import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { useContext } from 'react';

export interface ITaxonomyDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  error?: boolean;
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

  if (!dataGridProps.value) {
    return null;
  }

  const response = taxonomyContext.getCachedSpeciesTaxonomyById(dataGridProps.value);

  if (!response) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      component="div"
      sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: props.error ? 'error' : undefined }}>
      {response.label}
    </Typography>
  );
};

export default TaxonomyDataGridViewCell;
