import { mdiCogOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, MeasurementColumn } from 'contexts/observationsTableContext';
import { ConfigureColumnsPopoverContent } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumnsPopoverContent';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';

export interface IConfigureColumnsProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabled: boolean;
  /**
   * The column field names of the hidden columns.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsProps
   */
  hiddenFields: string[];
  /**
   * The column definitions of the columns that may be toggled to hidden or visible.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsProps
   */
  hideableColumns: GridColDef<IObservationTableRow>[];
  /**
   * Callback fired when a column is toggled to hidden or visible.
   *
   * @memberof IConfigureColumnsProps
   */
  onToggleColumnVisibility: (field: string) => void;
  /**
   * Callback fired when all columns are toggled to hidden or visible.
   *
   * @memberof IConfigureColumnsProps
   */
  onToggleShowHideAll: () => void;
  /**
   * Controls the disabled state of the addF measurement column buttons.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabledAddMeasurements: boolean;
  /**
   * Controls the disabled state of the remove measurement column buttons.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabledRemoveMeasurements: boolean;
  /**
   * The measurement columns to render in the table.
   *
   * @type {MeasurementColumn[]}
   * @memberof IConfigureColumnsProps
   */
  measurementColumns: MeasurementColumn[];
  /**
   * Callback fired when a measurement column is removed.
   *
   * @memberof IConfigureColumnsProps
   */
  onRemoveMeasurements: (measurementFields: string[]) => void;
  /**
   * Callback fired when a measurement column is added.
   *
   * @memberof IConfigureColumnsProps
   */
  onAddMeasurements: (measurements: CBMeasurementType[]) => void;
}

/**
 * Renders a button, which renders a popover, to manage the observation table columns.
 *
 * @param {IConfigureColumnsProps} props
 * @return {*}
 */
export const ConfigureColumns = (props: IConfigureColumnsProps) => {
  const {
    disabled,
    hiddenFields,
    hideableColumns,
    onToggleColumnVisibility,
    onToggleShowHideAll,
    disabledAddMeasurements,
    disabledRemoveMeasurements,
    measurementColumns,
    onRemoveMeasurements,
    onAddMeasurements
  } = props;

  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  return (
    <>
      <IconButton
        color="default"
        onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}
        disabled={disabled}>
        <Icon path={mdiCogOutline} size={1} />
      </IconButton>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        id="survey-observations-table-actions-menu"
        anchorEl={columnVisibilityMenuAnchorEl}
        open={Boolean(columnVisibilityMenuAnchorEl)}
        onClose={() => setColumnVisibilityMenuAnchorEl(null)}>
        <ConfigureColumnsPopoverContent
          hiddenFields={hiddenFields}
          hideableColumns={hideableColumns}
          onToggleColumnVisibility={onToggleColumnVisibility}
          onToggledShowHideAll={onToggleShowHideAll}
          disabledAddMeasurements={disabledAddMeasurements}
          disabledRemoveMeasurements={disabledRemoveMeasurements}
          measurementColumns={measurementColumns}
          onRemoveMeasurements={onRemoveMeasurements}
          onAddMeasurements={onAddMeasurements}
        />
      </Popover>
    </>
  );
};
