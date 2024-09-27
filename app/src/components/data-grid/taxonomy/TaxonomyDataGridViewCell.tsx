import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTaxonomyContext } from 'hooks/useContext';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useEffect, useState } from 'react';

export interface IPartialTaxonomyDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  error?: boolean;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {IPartialTaxonomyDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
const TaxonomyDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: IPartialTaxonomyDataGridViewCellProps<DataGridType>
) => {
  const { dataGridProps } = props;

  const taxonomyContext = useTaxonomyContext();

  const [taxon, setTaxon] = useState<IPartialTaxonomy | null>(null);

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
        color: props.error ? 'error' : undefined,
        '& .speciesCommonName': {
          display: 'inline-block',
          '&::first-letter': {
            textTransform: 'capitalize'
          }
        }
      }}>
      {taxon.commonNames.length ? (
        <>
          <Typography
            component="span"
            variant="body2"
            className="speciesCommonName"
            sx={{
              display: 'inline-block',
              '&::first-letter': {
                textTransform: 'capitalize'
              }
            }}>
            {taxon.scientificName.split(' ').length > 1 ? <em>{taxon.scientificName}</em> : <>{taxon.scientificName}</>}
          </Typography>
          &nbsp;({taxon.commonNames.join(', ')})
        </>
      ) : (
        <em>{taxon.scientificName}</em>
      )}
    </Typography>
  );
};

export default TaxonomyDataGridViewCell;
