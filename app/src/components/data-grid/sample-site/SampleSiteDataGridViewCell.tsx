import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { ISampleSiteOption } from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';

export interface IPartialSampleSiteDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  sampleSite?: ISampleSiteOption;
  error?: boolean;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {IPartialSampleSiteDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
const SampleSiteDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: IPartialSampleSiteDataGridViewCellProps<DataGridType>
) => {
  const { sampleSite, error } = props;

  return (
    <Typography
      variant="body2"
      component="div"
      sx={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: error ? 'error' : undefined,
        '& .speciesCommonName': {
          display: 'inline-block',
          '&::first-letter': {
            textTransform: 'capitalize'
          }
        }
      }}>
      <Typography component="span" variant="body2">
        {sampleSite?.sample_site_name ?? ''}
      </Typography>
    </Typography>
  );
};

export default SampleSiteDataGridViewCell;
