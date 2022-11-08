import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export interface ISecurityDialogProps {
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IComponentDialogProps
   */
  open: boolean;
  /**
   * TODO: finish Secuirty Dialog Implementation
   *
   * @memberof ISecurityDialogProps
   */
  onAccept: () => any;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IComponentDialogProps
   */
  onClose: () => void;
  /**
   * `Dialog` props passthrough.
   *
   * @type {Partial<DialogProps>}
   * @memberof IComponentDialogProps
   */
  dialogProps?: Partial<DialogProps>;
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const SecurityDialog: React.FC<ISecurityDialogProps> = (props) => {
  if (!props.open) {
    return <></>;
  }
  /* Prototype Dialog for Applying Security Reasons */

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle>Apply Security Reasons</DialogTitle>
      <DialogContent style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Typography variant="body1" color="textSecondary" style={{ marginBottom: '24px' }}>
          Apply one or more security reasons to selected documents.
        </Typography>
        <Divider></Divider>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="70" padding="checkbox"></TableCell>
                <TableCell width="200">Category</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell width="160">Expiry Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>Persecution or Harm</TableCell>
                <TableCell>
                  <Typography style={{ fontWeight: 700 }}>Reason Title</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Reason Description
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField type="date" variant="outlined" size="small"></TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>Persecution or Harm</TableCell>
                <TableCell>
                  <Typography style={{ fontWeight: 700 }}>Reason Title</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Reason Description
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField type="date" variant="outlined" size="small" fullWidth></TextField>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={props.onAccept}>
          Apply
        </Button>
        <Button color="primary" variant="outlined" onClick={props.onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecurityDialog;
