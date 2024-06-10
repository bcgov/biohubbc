import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';
import SamplingTechniqueCard from './SamplingTechniqueCard';

interface ISamplingTechniqueCardContainer {
  techniques: IGetTechnique[];
}
/**
 * Returns accordian cards for displaying technique technique details on the technique profile page
 *
 * @returns
 */
export const SamplingTechniqueCardContainer = (props: ISamplingTechniqueCardContainer) => {
  const { techniques } = props;

  const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
  const [techniqueAnchorEl, setTechniqueAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();
  const biohubApi = useBiohubApi();

  /**
   * Handle the delete technique API call.
   *
   */
  const handleDeleteTechnique = async () => {
    await biohubApi.technique
      .deleteTechnique(surveyContext.projectId, surveyContext.surveyId, Number(selectedTechnique))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setTechniqueAnchorEl(null);
        surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setTechniqueAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Technique</strong>
              </Typography>
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete technique dialog.
   *
   */
  const deleteTechniqueDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Technique?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this technique?
        </Typography>
      ),
      yesButtonLabel: 'Delete Technique',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleDeleteTechnique();
      }
    });
  };

  return (
    <>
      {selectedTechnique && (
        <Menu
          sx={{ pb: 2 }}
          open={Boolean(techniqueAnchorEl)}
          onClose={() => setTechniqueAnchorEl(null)}
          anchorEl={techniqueAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          <MenuItem
            sx={{
              p: 0,
              '& a': {
                display: 'flex',
                px: 2,
                py: '6px',
                textDecoration: 'none',
                color: 'text.primary',
                borderRadius: 0,
                '&:focus': {
                  outline: 'none'
                }
              }
            }}>
            <RouterLink
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/technique/${selectedTechnique}/edit`}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTechniqueAnchorEl(null);
              deleteTechniqueDialog();
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {techniques.map((technique) => (
        <Box m={2} key={technique.method_technique_id}>
          <SamplingTechniqueCard
            technique={technique}
            method_lookup_name={
              getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? ''
            }
            handleMenuClick={(event) => {
              setTechniqueAnchorEl(event.currentTarget);
              setSelectedTechnique(technique.method_technique_id);
            }}
          />
        </Box>
      ))}
    </>
  );
};
