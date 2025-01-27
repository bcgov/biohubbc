import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { SamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';

export interface IPartialMethodTechniqueDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;
  error?: boolean;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {IPartialMethodTechniqueDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
export const MethodTechniqueDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: IPartialMethodTechniqueDataGridViewCellProps<DataGridType>
) => {
  const { dataGridProps, samplingInformationCache, error } = props;

  const label = samplingInformationCache.getCurrentTechnique(dataGridProps)?.label ?? '';

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
        {label}
      </Typography>
    </Typography>
  );
};
