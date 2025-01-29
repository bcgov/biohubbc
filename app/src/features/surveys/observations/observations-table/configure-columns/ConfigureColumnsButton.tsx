import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { GridColDef, GridRowModes } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useConfigureEnvironmentColumns } from 'features/surveys/observations/observations-table/configure-columns/components/environment/useConfigureEnvironmentColumns';
import { useConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/useConfigureGeneralColumns';
import { useConfigureMeasurementColumns } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/useConfigureMeasurementColumns';
import { useCodesContext, useObservationsTableContext } from 'hooks/useContext';
import { useEffect, useMemo, useState } from 'react';
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

export interface IHideableColumn
  extends Pick<GridColDef<IObservationTableRow>, 'field' | 'headerName' | 'description'> {
  options: { name: string; description: string }[];
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
  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const observationsTableContext = useObservationsTableContext();

  // The currently hidden fields
  const hiddenFields = Object.keys(observationsTableContext.columnVisibilityModel).filter(
    (key) => observationsTableContext.columnVisibilityModel[key] === false
  );

  // Utility function for finding qualitative options for a given measurement or environment column
  const hideableColumns: IHideableColumn[] = useMemo(() => {
    // Map columns to their IHideableColumn definitions to ensure no duplicates
    const columnMap = new Map<string, IHideableColumn>();

    // Add all standard, hideable columns
    columns
      .filter((column) => column?.hideable)
      .forEach((column) => {
        if (column.headerName?.toLowerCase() === 'sign') {
          columnMap.set(column.field, {
            ...column,
            options:
              codesContext.codesDataLoader.data?.observation_subcount_signs.map((sign) => ({
                name: sign.name,
                description: sign.description
              })) ?? []
          });
          return;
        }
        columnMap.set(column.field, { ...column, options: [] });
      });

    // Map and update measurement columns
    columns
      .filter((column) =>
        observationsTableContext.measurementColumns.some(
          (measurement) => column.headerName?.toLowerCase() === measurement.measurement_name.toLowerCase()
        )
      )
      .forEach((column) => {
        const foundMeasurement = observationsTableContext.measurementColumns.find(
          (measurement) => column.headerName?.toLowerCase() === measurement.measurement_name.toLowerCase()
        );
        if (foundMeasurement && 'options' in foundMeasurement) {
          columnMap.set(column.field, {
            ...column,
            options:
              foundMeasurement.options.map((option) => ({
                name: option.option_label,
                description: option.option_desc
              })) ?? []
          } as IHideableColumn);
        }
      });

    // Map and update environment columns
    columns
      .filter((column) =>
        [
          ...observationsTableContext.environmentColumns.quantitative_environments,
          ...observationsTableContext.environmentColumns.qualitative_environments
        ].some((environment) => environment.name === column.headerName)
      )
      .forEach((column) => {
        const foundEnvironment = observationsTableContext.environmentColumns.qualitative_environments.find(
          (environment) => column.headerName === environment.name
        );
        if (foundEnvironment) {
          columnMap.set(column.field, {
            ...column,
            options: foundEnvironment.options ?? []
          } as IHideableColumn);
        }
      });

    // Return the updated columns, using the map to ensure no duplicates
    return Array.from(columnMap.values());
  }, [columns, observationsTableContext]);

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
