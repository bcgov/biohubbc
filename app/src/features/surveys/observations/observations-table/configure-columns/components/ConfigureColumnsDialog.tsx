import { LoadingButton } from '@mui/lab';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { ConfigureColumnsPage } from 'features/surveys/observations/observations-table/configure-columns/components/ConfigureColumnsPage';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';

interface IConfigureColumnsDialogProps {
  /**
   * Controls the visibility of the dialog.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsDialogProps
   */
  open: boolean;
  /**
   * Callback fired on closing the dialog.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onClose: () => void;
  /**
   * Controls the disabled state of the component controls.
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
   * Callback fired on toggling the visibility of all columns.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onToggleShowHideAll: () => void;
  /**
   * Callback fired on toggling the visibility of a column.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onToggleColumnVisibility: (field: string) => void;
  /**
   * Callback fired on removing measurements.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
  /**
   * The measurement columns.
   *
   * @type {CBMeasurementType[]}
   * @memberof IConfigureColumnsDialogProps
   */
  measurementColumns: CBMeasurementType[];
  /**
   * Callback fired on adding measurement columns.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onAddMeasurementColumns: (measurementColumns: CBMeasurementType[]) => void;
  /**
   * Callback fired on removing measurement columns.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onRemoveMeasurementColumns: (fields: string[]) => void;
  /**
   * The environment columns.
   *
   * @type {EnvironmentType}
   * @memberof IConfigureColumnsDialogProps
   */
  environmentColumns: EnvironmentType;
  /**
   * Callback fired on adding environment columns.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType) => void;
  /**
   * Callback fired on removing environment columns.
   *
   * @memberof IConfigureColumnsDialogProps
   */
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
}

/**
 * Renders a dialog to configure the columns of the observations table.
 *
 * @param {IConfigureColumnsDialogProps} props
 * @return {*}
 */
export const ConfigureColumnsDialog = (props: IConfigureColumnsDialogProps) => {
  const {
    open,
    onClose,
    disabled,
    hiddenFields,
    hideableColumns,
    onRemoveMeasurements,
    onToggleColumnVisibility,
    onToggleShowHideAll,
    measurementColumns,
    onAddMeasurementColumns,
    onRemoveMeasurementColumns,
    environmentColumns,
    onAddEnvironmentColumns,
    onRemoveEnvironmentColumns
  } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { maxWidth: 1200, minHeight: '75vh' } }}
      fullWidth
      open={open}
      onClose={onClose}
      data-testid="yes-no-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        Configure Columns
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          Customize the columns in your table to upload additional data, such as environmental variables and species
          measurements.
        </Typography>
      </DialogTitle>
      <DialogContent id="configure-dialog-content">
        <ConfigureColumnsPage
          disabled={disabled}
          hiddenFields={hiddenFields}
          hideableColumns={hideableColumns}
          onToggleShowHideAll={onToggleShowHideAll}
          onToggleColumnVisibility={onToggleColumnVisibility}
          onRemoveMeasurements={onRemoveMeasurements}
          measurementColumns={measurementColumns}
          onAddMeasurementColumns={onAddMeasurementColumns}
          onRemoveMeasurementColumns={onRemoveMeasurementColumns}
          environmentColumns={environmentColumns}
          onAddEnvironmentColumns={onAddEnvironmentColumns}
          onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton data-testid="no-button" onClick={props.onClose} color="primary" variant="outlined">
          Close
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
