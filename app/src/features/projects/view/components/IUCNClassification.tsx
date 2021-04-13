import { Box, Button, Divider, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IProjectIUCNForm,
  ProjectIUCNFormYupSchema,
  ProjectIUCNFormArrayItemInitialValues,
  ProjectIUCNFormInitialValues
} from 'features/projects/components/ProjectIUCNForm';
import EditDialog from 'components/dialog/EditDialog';
import { EditIUCNI18N } from 'constants/i18n';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { APIError } from 'hooks/api/useAxios';
import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme) => ({
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

  const biohubApi = useBiohubApi();
  const classes = useStyles();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditIUCNI18N.editErrorTitle,
    dialogText: EditIUCNI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [iucnFormData, setIucnFormData] = useState(ProjectIUCNFormInitialValues);

  const handleDialogEditOpen = async () => {
    let iucnResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.iucn]);

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
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = new APIError(error);
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
      <ErrorDialog {...errorDialogProps} />

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
        <Typography variant="h3">IUCN Classifications</Typography>
        <Button
          className="editButtonSmall"
          onClick={() => handleDialogEditOpen()}
          title="Edit IUCN Classifications"
          aria-label="Edit General Information"
          startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
          EDIT
        </Button>
      </Box>

      {iucn.classificationDetails.length > 0 && (
        <Box component="ul" className="listNoBullets">
          {hasIucnClassifications &&
            iucn.classificationDetails.map((classificationDetail: any, index: number) => {
              return (
                <Box component="li" key={index} className={classes.iucnListItem}>
                  <Divider />
                  <Box>
                    <Typography component="span" variant="body1">
                      {classificationDetail.classification} <span>{'>'}</span> {classificationDetail.subClassification1}{' '}
                      <span>{'>'}</span> {classificationDetail.subClassification2}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
        </Box>
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
