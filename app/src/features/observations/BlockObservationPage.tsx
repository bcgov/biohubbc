import HotTable from '@handsontable/react';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState, useContext } from 'react';
import BlockObservationForm, { BlockObservationInitialValues } from './components/BlockObservationForm';
import { Prompt, useHistory, useParams } from 'react-router';
import { DialogContext } from 'contexts/dialogContext';
import { AddBlockObservationI18N } from 'constants/i18n';
import * as History from 'history';

const useStyles = makeStyles(() => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

const BlockObservationPage = () => {
  const classes = useStyles();
  const urlParams = useParams();
  const history = useHistory();

  const dialogContext = useContext(DialogContext);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck] = useState(true);

  const hotRef = useRef<HotTable>(null);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  const [tableData] = useState<any[][]>([[, , , , , , , , , , , , , , ,]]);
  const [initialValues] = useState(BlockObservationInitialValues);

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];

  const defaultCancelDialogProps = {
    dialogTitle: AddBlockObservationI18N.cancelTitle,
    dialogText: AddBlockObservationI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Breadcrumbs>
              <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
                {/* <Typography variant="body2">{projectWithDetails.project.project_name}</Typography> */}
                <Typography variant="body2">Testing</Typography>
              </Link>
              <Typography variant="body2">Add Block Observation</Typography>
            </Breadcrumbs>
          </Box>
          <Box mb={3}>
            <Typography variant="h1">Add Block Observation</Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="body1">
              Lorem Ipsum dolor sit amet, consecteur, Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit
              amet, consecteur. Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet, consecteur
            </Typography>
          </Box>
          <Box display="block">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              enableReinitialize={true}
              validateOnBlur={false}
              validateOnChange={false}
              onSubmit={() => {}}>
              <BlockObservationForm tableRef={hotRef} tableData={tableData} />
            </Formik>
            <Box mt={2} mb={6} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => {}}
                className={classes.actionButton}>
                Save and Exit
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => {}}
                className={classes.actionButton}>
                Save and Next Block
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default BlockObservationPage;
