import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { getCurrentPeriod } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { MutableRefObject } from 'react';

export interface IPartialSamplePeriodDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  error?: boolean;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {IPartialSamplePeriodDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
export const SamplePeriodDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: IPartialSamplePeriodDataGridViewCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, error } = props;

  const label = getCurrentPeriod(dataGridProps, cachedSampleLocationsRef)?.label ?? '';

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
