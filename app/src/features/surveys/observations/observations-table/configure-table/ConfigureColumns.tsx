import { mdiCogOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, MeasurementColumn } from 'contexts/observationsTableContext';
import { ConfigureColumnsPopoverContent } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumnsPopoverContent';
import { Measurement } from 'hooks/cb_api/useLookupApi';
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
   * The column definitions of the columns rendered in the observations table
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsProps
   */
  hiddenFields: string[];
  hideableColumns: GridColDef<IObservationTableRow>[];
  onToggleColumnVisibility: (field: string) => void;
  onToggleShowHideAll: () => void;
  measurementColumns: MeasurementColumn[];
  onRemoveMeasurements: (measurementFields: string[]) => void;
  /**
   * Callback fired when a measurement column is added.
   *
   * @memberof IConfigureColumnsProps
   */
  onAddMeasurements: (measurements: Measurement[]) => void;
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
          hideableColumns={hideableColumns}
          hiddenFields={hiddenFields}
          measurementColumns={measurementColumns}
          onMeasurementsDelete={onRemoveMeasurements}
          onMeasurementsSave={onAddMeasurements}
          onToggleColumnVisibility={onToggleColumnVisibility}
          onToggledShowHideAll={onToggleShowHideAll}
        />
      </Popover>
    </>
  );
};
