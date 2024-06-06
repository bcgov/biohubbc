import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';
import SamplingTechniqueCard from './SamplingTechniqueCard';

interface ISamplingTechniqueCardContainer {
  techniques: IGetTechnique[];
  handleDelete: (selectedTechnique: number) => void; //Promise<void>;
}
/**
 * Returns accordian cards for displaying technique technique details on the technique profile page
 *
 * @returns
 */
export const SamplingTechniqueCardContainer = (props: ISamplingTechniqueCardContainer) => {
  const { techniques, handleDelete } = props;

  const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
  const [techniqueAnchorEl, setTechniqueAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [techniqueForDelete, setTechniqueForDelete] = useState<boolean>();

  const { projectId, surveyId } = useSurveyContext();
  const codesContext = useCodesContext();

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
            <RouterLink to={`/admin/projects/${projectId}/surveys/${surveyId}/technique/${selectedTechnique}/edit`}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTechniqueAnchorEl(null);
              setTechniqueForDelete(true);
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {techniqueForDelete && selectedTechnique && (
        <YesNoDialog
          dialogTitle={'Delete technique?'}
          dialogText={
            'Are you sure you want to permanently delete this technique? All information associated with the technique will be deleted.'
          }
          yesButtonProps={{ color: 'error' }}
          yesButtonLabel={'Delete'}
          noButtonProps={{ color: 'primary', variant: 'outlined' }}
          noButtonLabel={'Cancel'}
          open={Boolean(techniqueForDelete)}
          onYes={() => {
            setTechniqueForDelete(false);
            handleDelete(selectedTechnique);
          }}
          onClose={() => setTechniqueForDelete(false)}
          onNo={() => setTechniqueForDelete(false)}
        />
      )}

      {techniques.length ? (
        techniques.map((technique) => (
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
        ))
      ) : (
        <Box
          flex="1 1 auto"
          borderRadius="5px"
          minHeight="150px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor={grey[200]}>
          <Typography variant="body2" color="textSecondary">
            This Survey has no techniques
          </Typography>
        </Box>
      )}
    </>
  );
};
