import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import { getCurrentMethod } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { useCodesContext } from 'hooks/useContext';
import { MutableRefObject } from 'react';
import { getCodesName } from 'utils/Utils';

export interface IPartialObservationCountDataGridEditCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>;
  error?: boolean;
}

/**
 *
 *
 * @template DataGridType
 * @param {IPartialObservationCountDataGridEditCellProps<DataGridType>} props
 * @return {*}
 */
export const ObservationCountDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: IPartialObservationCountDataGridEditCellProps<DataGridType>
) => {
  const { dataGridProps, cachedSampleLocationsRef, error } = props;

  const codesContext = useCodesContext();

  const getResponseMetric = () => {
    const currentMethod = getCurrentMethod(dataGridProps, cachedSampleLocationsRef);

    if (!currentMethod) {
      return null;
    }

    return getCodesName(
      codesContext.codesDataLoader.data,
      'method_response_metrics',
      currentMethod.method_response_metric_id
    );
  };

  const maxCount = getResponseMetric() === 'Presence-absence' ? 1 : undefined;

  return (
    <TextFieldDataGrid
      dataGridProps={dataGridProps}
      textFieldProps={{
        type: 'number',
        inputProps: {
          max: maxCount,
          inputMode: 'numeric'
        },
        name: dataGridProps.field,
        onChange: (event) => {
          if (!/^\d{0,7}$/.test(event.target.value)) {
            // If the value is not a number, return
            return;
          }

          dataGridProps.api.setEditCellValue({
            id: dataGridProps.id,
            field: dataGridProps.field,
            value: event.target.value
          });
        },
        error
      }}
    />
  );
};
