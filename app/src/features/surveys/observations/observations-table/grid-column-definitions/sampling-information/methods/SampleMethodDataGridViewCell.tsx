import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { getCurrentMethod } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { MutableRefObject } from 'react';

export interface IPartialSampleMethodDataGridViewCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  error?: boolean;
}

/**
 * Data grid taxonomy component for view.
 *
 * @template DataGridType
 * @param {IPartialSampleMethodDataGridViewCellProps<DataGridType>} props
 * @return {*}
 */
export const SampleMethodDataGridViewCell = <DataGridType extends GridValidRowModel>(
  props: IPartialSampleMethodDataGridViewCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, error } = props;

  const label = getCurrentMethod(dataGridProps, cachedSampleLocationsRef)?.label ?? '';

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
