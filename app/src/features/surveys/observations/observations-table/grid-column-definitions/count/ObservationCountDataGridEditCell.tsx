import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import TextFieldDataGrid from 'components/data-grid/TextFieldDataGrid';
import { SamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { useCodesContext } from 'hooks/useContext';
import { getCodesName } from 'utils/Utils';

export interface IPartialObservationCountDataGridEditCellProps<DataGridType extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<DataGridType>;
  samplingInformationCache: SamplingInformationCache;

  error?: boolean;
}

const RESPONSE_METRIC_PRESENCE_ABSENCE = 'Presence-absence';

/**
 * Count data grid component for edit.
 *
 * @template DataGridType
 * @param {IPartialObservationCountDataGridEditCellProps<DataGridType>} props
 * @return {*}
 */
export const ObservationCountDataGridEditCell = <DataGridType extends GridValidRowModel>(
  props: IPartialObservationCountDataGridEditCellProps<DataGridType>
) => {
  const { dataGridProps, samplingInformationCache, error } = props;

  const codesContext = useCodesContext();

  const getResponseMetric = () => {
    const currentTechnique = samplingInformationCache.getCurrentTechnique(dataGridProps);

    if (!currentTechnique) {
      return null;
    }

    return getCodesName(
      codesContext.codesDataLoader.data,
      'method_response_metrics',
      currentTechnique.method_response_metric_id
    );
  };

  // Set the max count to 1, if the response metric is 'Presence-absence'
  const maxCount = getResponseMetric() === RESPONSE_METRIC_PRESENCE_ABSENCE ? 1 : undefined;

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
