import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { GridColDef, GridRowModes } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/useConfigureGeneralColumns';
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
  options: { name: string; description: string | null }[];
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

  // Columns that can be hidden from the table (visibility toggled on/off)
  const hideableColumns: IHideableColumn[] = useMemo(() => {
    const columnMap = new Map<string, IHideableColumn>();

    columns.forEach((column) => {
      if (!column?.hideable) {
        return;
      }

      let options: { name: string; description: string | null }[] = [];

      if (column.headerName?.toLowerCase() === 'sign') {
        options =
          codesContext.codesDataLoader.data?.observation_signs.map((sign) => ({
            name: sign.name,
            description: sign.description
          })) ?? [];
      } else {
        const foundMeasurement = observationsTableContext.measurementColumns.find(
          (measurement) => column.headerName?.toLowerCase() === measurement.measurement_name.toLowerCase()
        );

        if (foundMeasurement && 'options' in foundMeasurement) {
          options =
            foundMeasurement.options.map((option) => ({
              name: option.option_label,
              description: option.option_desc
            })) ?? [];
        } else {
          const foundEnvironment = [
            ...observationsTableContext.environmentColumns.quantitative_environments,
            ...observationsTableContext.environmentColumns.qualitative_environments
          ].find((environment) => column.headerName?.toLowerCase() === environment.name.toLowerCase());

          if (foundEnvironment && 'options' in foundEnvironment) {
            options = foundEnvironment.options ?? [];
          }
        }
      }

      columnMap.set(column.field, { ...column, options });
    });

    return Array.from(columnMap.values());
  }, [columns, codesContext.codesDataLoader.data, observationsTableContext]);

  const { onToggleShowHideAll, onToggleColumnVisibility } = useConfigureGeneralColumns({ hideableColumns });

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
      />
    </>
  );
};
