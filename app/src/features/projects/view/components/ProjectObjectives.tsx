import { Box, Typography, Breadcrumbs, makeStyles, Link, Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import ReadMoreField from 'components/fields/ReadMoreField';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import React, { useEffect, useState } from 'react';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { EditObjectivesI18N } from 'constants/i18n';
import { useHistory } from 'react-router';
import { useBiohubApi } from 'hooks/useBioHubApi';
//import { ArrowBack } from '@material-ui/icons';

export interface IProjectObjectivesProps {
  projectWithDetailsData: IProjectWithDetails;
}

const useStyles = makeStyles((theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  finishContainer: {
    padding: theme.spacing(3),
    backgroundColor: 'transparent'
  },
  stepper: {
    backgroundColor: 'transparent'
  },
  stepTitle: {
    marginBottom: '0.45rem'
  }
}));

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectWithDetailsData: { objectives }
  } = props;

  const history = useHistory();
  const classes = useStyles();

  const handleCancel = () => {
    setOpenCancelDialog(true);
  };

  const handleYesNoDialogClose = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogNo = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogYes = () => {
    history.push('/projects');
  };

  const biohubApi = useBiohubApi();

  const [getcodes, setCodes] = useState<IGetAllCodesResponse>();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // Whether or not to show the 'Are you sure you want to cancel' dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // Whether or not to show the text dialog
  const [openErrorDialogProps, setOpenErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditObjectivesI18N.createErrorTitle,
    dialogText: EditObjectivesI18N.createErrorText,
    open: false,
    onClose: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    },
    onOk: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    }
  });

  /**
   * Handle creation of partial or full projects.
   */
  // const handleSubmit = async () => {
  //   try {
  //     //save the record
  //   } catch (error) {
  //     showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
  //   }
  // };

  // const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
  //   setOpenErrorDialogProps({ ...openErrorDialogProps, ...textDialogProps, open: true });
  // };

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodes = async () => {
      const response = await biohubApi.getAllCodes();

      if (!response) {
        // TODO error handling/user messaging - Cant create a project if required code sets fail to fetch
      }

      setCodes(() => {
        setIsLoadingCodes(false);
        return response;
      });
    };

    if (!isLoadingCodes && !getcodes) {
      getAllCodes();
      setIsLoadingCodes(true);
    }
  }, [biohubApi, isLoadingCodes, getcodes]);

  // Initialize the forms for each step of the workflow
  useEffect(() => {
    if (!getcodes) {
      return;
    }
  }, [getcodes]);

  return (
    <>
      <YesNoDialog
        dialogTitle={EditObjectivesI18N.editTitle}
        dialogText={EditObjectivesI18N.editText}
        open={openCancelDialog}
        onClose={handleYesNoDialogClose}
        onNo={handleDialogNo}
        onYes={handleDialogYes}
      />
      <ErrorDialog {...openErrorDialogProps} />
      <Box m={3}>
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Objectives</Typography>
            </Grid>
            <Grid item>
            <Breadcrumbs>
              <Link color="primary" onClick={handleCancel} aria-label="Edit Objectives Information" className={classes.breadCrumbLink}>
                <Edit color="primary" fontSize="inherit" className={classes.breadCrumbLinkIcon} />
                <Typography variant="body2">EDIT</Typography>
              </Link>
            </Breadcrumbs>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <Grid item xs={12}>
              <ReadMoreField text={objectives.objectives} maxCharLength={850} />
            </Grid>
          </Grid>

          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Caveats</Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <Grid item xs={12}>
              <ReadMoreField text={objectives.caveats} maxCharLength={850} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
