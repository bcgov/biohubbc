import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { EditDialog } from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSpeciesI18N } from 'constants/i18n';
import {
  IProjectSpeciesForm,
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface ISpeciesProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Species content for a project.
 *
 * @return {*}
 */
const Species: React.FC<ISpeciesProps> = (props) => {
  const {
    projectForViewData: {
      species: { focal_species, ancillary_species },
      id
    },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [speciesForUpdate, setSpeciesForUpdate] = useState(ProjectSpeciesFormInitialValues);

  const handleDialogEditOpen = async () => {
    let speciesResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.species]);

      if (!response?.species) {
        showErrorDialog({ open: true });
        return;
      }

      speciesResponseData = response.species;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setSpeciesForUpdate(speciesResponseData);

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectSpeciesForm) => {
    const projectData = { species: values };

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

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSpeciesI18N.editErrorTitle,
    dialogText: EditSpeciesI18N.editErrorText,
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

  const hasFocalSpecies = focal_species && focal_species.length > 0;
  const hasAnciliarySpecies = ancillary_species && ancillary_species.length > 0;

  return (
    <>
      <EditDialog
        dialogTitle={EditSpeciesI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectSpecies" codes={codes} />,
          initialValues: speciesForUpdate,
          validationSchema: ProjectSpeciesFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />

      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Species</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Species"
            aria-label="Edit Species"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>

        <dl className="ddInline">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Focal Species
              </Typography>
              {focal_species?.map((focalSpecies: number, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {focalSpecies}
                  </Typography>
                );
              })}
              {!hasFocalSpecies && (
                <Typography component="dd" variant="body1">
                  No Focal Species
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Anciliary Species
              </Typography>
              {ancillary_species?.map((ancillarySpecies: number, index: number) => {
                return (
                  <Typography component="dd" variant="body1" key={index}>
                    {ancillarySpecies}
                  </Typography>
                );
              })}
              {!hasAnciliarySpecies && (
                <Typography component="dd" variant="body1">
                  No Ancilliary Species
                </Typography>
              )}
            </Grid>
          </Grid>
        </dl>
      </Box>
    </>
  );
};

export default Species;
