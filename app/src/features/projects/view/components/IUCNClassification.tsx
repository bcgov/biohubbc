import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditIUCNI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectIUCNForm,
  ProjectIUCNFormArrayItemInitialValues,
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
} from 'features/projects/components/ProjectIUCNForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  iucnListItem: {
    '& hr': {
      marginBottom: theme.spacing(2)
    },

    '& + li': {
      paddingTop: theme.spacing(2)
    }
  }
}));

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn, id },
    codes
  } = props;

  const restorationTrackerApi = useRestorationTrackerApi();
  const classes = useStyles();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditIUCNI18N.editErrorTitle,
    dialogText: EditIUCNI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [iucnFormData, setIucnFormData] = useState(ProjectIUCNFormInitialValues);

  const handleDialogEditOpen = async () => {
    let iucnResponseData;

    try {
      const response = await restorationTrackerApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.iucn]);

      if (!response?.iucn) {
        showErrorDialog({ open: true });
        return;
      }

      iucnResponseData = response.iucn;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setIucnFormData({
      classificationDetails: iucnResponseData.classificationDetails
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectIUCNForm) => {
    const projectData = { iucn: values };

    try {
      await restorationTrackerApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditIUCNI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectIUCN" codes={codes} />,
          initialValues: iucnFormData?.classificationDetails?.length
            ? iucnFormData
            : { classificationDetails: [ProjectIUCNFormArrayItemInitialValues] },
          validationSchema: ProjectIUCNFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />

      <H3ButtonToolbar
        label="IUCN Conservation Actions Classification"
        buttonLabel="Edit"
        buttonTitle="Edit IUCN Classifications"
        buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
        buttonOnClick={() => handleDialogEditOpen()}
        toolbarProps={{ disableGutters: true }}
      />

      <Box component={Divider} mb={0}></Box>

      {hasIucnClassifications && (
        <List disablePadding>
          {iucn.classificationDetails.map((classificationDetail: any, index: number) => {
            return (
              <ListItem key={index} className={classes.iucnListItem} divider disableGutters>
                <Typography variant="body2">
                  {classificationDetail.classification} <span>{'>'}</span> {classificationDetail.subClassification1}{' '}
                  <span>{'>'}</span> {classificationDetail.subClassification2}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      )}

      {!hasIucnClassifications && (
        <Box component="ul" className="listNoBullets">
          <Box component="li" className={classes.iucnListItem}>
            <Typography component="dd" variant="body1">
              No IUCN Classifications
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default IUCNClassification;
