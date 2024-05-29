import { mdiChevronDown, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';
import { TechniqueCardDetails } from './TechniqueCardDetails';

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

  const handleTechniqueMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, techniqueId: number) => {
    setTechniqueAnchorEl(event.currentTarget);
    setSelectedTechnique(techniqueId);
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
          dialogTitle={'Delete technique event?'}
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
        techniques.map((technique) => {
          return (
            <Accordion
              component={Paper}
              variant='outlined'
              disableGutters
              key={technique.method_technique_id}
              sx={{
                margin: '15px',
                boxShadow: 'none',
                px: 1,
                borderRadius: '5px',
                '&.Mui-expanded': {
                  margin: '15px !important'
                },
                '&:before': {
                  display: 'none'
                }
              }}>
              <Box display="flex" alignItems="center">
                <AccordionSummary
                  expandIcon={<Icon path={mdiChevronDown} size={1} />}
                  aria-controls="panel1bh-content"
                  sx={{
                    flex: '1 1 auto',
                    mr: 1,
                    pr: 8.5,
                    minHeight: 55,
                    overflow: 'hidden',
                    border: 0,
                    '& .MuiAccordionSummary-content': {
                      flex: '1 1 auto',
                      py: 0,
                      pl: 0,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }
                  }}>
                  <Stack gap={0.5} display="flex">
                    <Typography variant="h5">{technique.name}</Typography>
                    <Typography color="textSecondary">
                      {getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id)}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <IconButton
                  sx={{ position: 'absolute', right: '24px' }}
                  edge="end"
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                    handleTechniqueMenuClick(event, technique.method_technique_id)
                  }
                  aria-label="sample-site-settings">
                  <Icon path={mdiDotsVertical} size={1}></Icon>
                </IconButton>
              </Box>
              <AccordionDetails>
                <TechniqueCardDetails technique={technique} />
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Box
          flex="1 1 auto"
          borderRadius="5px"
          minHeight="70px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor={grey[50]}>
          <Typography variant="body2" color="textSecondary">
            This technique has no techniques
          </Typography>
        </Box>
      )}
    </>
  );
};

export default SamplingTechniqueCardContainer;
