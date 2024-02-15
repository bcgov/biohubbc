import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useContext, useEffect, useState } from 'react';

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

  const [taxon, setTaxon] = useState<ITaxonomy | null>(null);

  useEffect(() => {
    const response = taxonomyContext.getCachedSpeciesTaxonomyById(dataGridProps.value);

    if (!response) {
      return;
    }

    setTaxon(response);
  }, [taxonomyContext, dataGridProps.value]);

  if (!dataGridProps.value) {
    return null;
  }

  if (!taxon) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      component="div"
      sx={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: props.error ? 'error' : undefined
      }}>
      {[taxon.commonName, `(${taxon.scientificName})`].filter(Boolean).join(' ')}
    </Typography>
  );
};

export default TaxonomyDataGridViewCell;
