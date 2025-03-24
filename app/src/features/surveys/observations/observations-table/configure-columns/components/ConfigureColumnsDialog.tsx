import { LoadingButton } from '@mui/lab';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { ConfigureColumnsPage } from 'features/surveys/observations/observations-table/configure-columns/components/ConfigureColumnsPage';
import { IHideableColumn } from '../ConfigureColumnsButton';

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
   * @type {IHideableColumn[]}
   * @memberof IConfigureColumnsProps
   */
  hideableColumns: IHideableColumn[];
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
}

/**
 * Renders a dialog to configure the columns of the observations table.
 *
 * @param {IConfigureColumnsDialogProps} props
 * @return {*}
 */
export const ConfigureColumnsDialog = (props: IConfigureColumnsDialogProps) => {
  const { open, onClose, disabled, hiddenFields, hideableColumns, onToggleColumnVisibility, onToggleShowHideAll } =
    props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { maxWidth: 1200, height: '75vh' }, py: 0 }}
      fullWidth
      open={open}
      onClose={onClose}
      data-testid="yes-no-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        Configure Columns
        <Typography color="textSecondary" sx={{ mt: 1 }}>
          Customize the columns displayed in the table. You can expand the items below to view additional information
          about the column.
        </Typography>
      </DialogTitle>
      <DialogContent id="configure-dialog-content" sx={{ overflowY: 'hidden', py: 0 }}>
        <ConfigureColumnsPage
          disabled={disabled}
          hiddenFields={hiddenFields}
          hideableColumns={hideableColumns}
          onToggleShowHideAll={onToggleShowHideAll}
          onToggleColumnVisibility={onToggleColumnVisibility}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton data-testid="no-button" onClick={props.onClose} color="primary" variant="contained">
          Save & Close
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
