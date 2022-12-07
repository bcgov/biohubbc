import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SecurityReason } from 'interfaces/useSecurityApi.interface';
import React, { useRef, useState } from 'react';
import SecurityForm, { ISecurityForm, SecurityYupSchema } from './SecurityForm';

export interface ISecurityDialogProps {
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IComponentDialogProps
   */
  open: boolean;
  /**
   *
   * @memberof IComponentDialogProps
   */
  selectedSecurityRules: any[];
  /**
   * TODO: finish Secuirty Dialog Implementation
   *
   * @memberof ISecurityDialogProps
   */
  onAccept: (securityReasons: ISecurityForm) => any;
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
  const biohubApi = useBiohubApi();

  const securityReasonsDataLoader = useDataLoader(() => biohubApi.security.getSecurityReasons());

  const [formikRef] = useState(useRef<FormikProps<ISecurityForm>>(null));

  if (!props.open) {
    return <></>;
  }

  securityReasonsDataLoader.load();

  const getSecurityDialogContent = () => {
    if (securityReasonsDataLoader.isLoading) {
      return <CircularProgress className="pageProgress" size={40} />;
    }

    if (securityReasonsDataLoader.data) {
      return <SecurityForm availableSecurityReasons={securityReasonsDataLoader.data} />;
    }

    // Not loading, but also no data returned
    return <CircularProgress className="pageProgress" size={40} />;
  };

  /**
   * Map previously applied security reasons into initial `ISecurityForm` for list of security reasons
   *
   * @param securityReasons SecurityReason[]
   * @returns {*} {ISecurityForm}
   */
  const prepInitialSecurityValues = (securityReasons: SecurityReason[]): ISecurityForm => {
    return {
      security_reasons: securityReasons.map((item) => {
        return { security_reason_id: `${item.security_reason_id}` };
      })
    };
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={prepInitialSecurityValues(props.selectedSecurityRules)}
      validationSchema={SecurityYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(values) => props.onAccept(values)}>
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
          {getSecurityDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="contained" onClick={() => formikRef.current?.handleSubmit()}>
            Apply
          </Button>
          <Button color="primary" variant="outlined" onClick={props.onClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Formik>
  );
};

export default SecurityDialog;
