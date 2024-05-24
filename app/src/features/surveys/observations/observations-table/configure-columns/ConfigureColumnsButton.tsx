import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { GridColDef, GridRowModes } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useConfigureEnvironmentColumns } from 'features/surveys/observations/observations-table/configure-columns/components/environment/useConfigureEnvironmentColumns';
import { useConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/useConfigureGeneralColumns';
import { useConfigureMeasurementColumns } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/useConfigureMeasurementColumns';
import { useObservationsTableContext } from 'hooks/useContext';
import { useMemo, useState } from 'react';
import { ConfigureColumnsDialog } from './components/ConfigureColumnsDialog';

export interface IConfigureColumnsButtonProps {
  /**
   * Controls the disabled state of the component controls.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabled: boolean;
  /**
   * The column definitions of the columns to render in the table.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof ISpeciesObservationTableProps
   */
  columns: GridColDef<IObservationTableRow>[];
}

/**
 * Renders a button that opens a dialog to configure the columns of the observations table.
 *
 * @param {IConfigureColumnsButtonProps} props
 * @return {*}
 */
export const ConfigureColumnsButton = (props: IConfigureColumnsButtonProps) => {
  const { disabled, columns } = props;

  const [isOpen, setIsOpen] = useState(false);

  const observationsTableContext = useObservationsTableContext();

  // The currently hidden fields
  const hiddenFields = Object.keys(observationsTableContext.columnVisibilityModel).filter(
    (key) => observationsTableContext.columnVisibilityModel[key] === false
  );

  // The array of columns that may be toggled as hidden or visible
  const hideableColumns = useMemo(() => {
    return columns.filter((column) => column?.hideable);
  }, [columns]);

  const measurementColumns = observationsTableContext.measurementColumns;

  const environmentColumns = observationsTableContext.environmentColumns;

  const { onToggleShowHideAll, onToggleColumnVisibility } = useConfigureGeneralColumns({ hideableColumns });

  const { onAddMeasurementColumns, onRemoveMeasurementColumns } = useConfigureMeasurementColumns();

  const { onAddEnvironmentColumns, onRemoveEnvironmentColumns } = useConfigureEnvironmentColumns();

  // 'true' if any row is in edit mode
  const isAnyRowInEditMode = useMemo(() => {
    return Object.values(observationsTableContext.rowModesModel).some(
      (innerObj) => innerObj.mode === GridRowModes.Edit
    );
  }, [observationsTableContext.rowModesModel]);

  return (
    <>
      <Button
        color="primary"
        disabled={disabled || isAnyRowInEditMode}
        variant="outlined"
        data-testid="observation-measurements-button"
        onClick={() => setIsOpen(true)}
        startIcon={<Icon style={{ marginTop: '2px' }} path={mdiTableEdit} size={1} />}
        aria-label="Add Measurements">
        Configure
      </Button>
      <ConfigureColumnsDialog
        onClose={() => setIsOpen(false)}
        open={isOpen}
        disabled={disabled || isAnyRowInEditMode}
        hiddenFields={hiddenFields}
        hideableColumns={hideableColumns}
        onToggleShowHideAll={onToggleShowHideAll}
        onToggleColumnVisibility={onToggleColumnVisibility}
        onRemoveMeasurements={onRemoveMeasurementColumns}
        measurementColumns={measurementColumns}
        onAddMeasurementColumns={onAddMeasurementColumns}
        onRemoveMeasurementColumns={onRemoveMeasurementColumns}
        environmentColumns={environmentColumns}
        onAddEnvironmentColumns={onAddEnvironmentColumns}
        onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
      />
    </>
  );
};
