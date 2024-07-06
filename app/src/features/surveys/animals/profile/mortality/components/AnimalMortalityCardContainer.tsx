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
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { IMortalityWithSupplementaryData } from 'features/surveys/animals/profile/mortality/AnimalMortalityContainer';
import { AnimalMortalityCardDetailsContainer } from 'features/surveys/animals/profile/mortality/components/mortality-card-details/AnimalMortalityCardDetailsContainer';
import { useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';

interface IAnimalMortalityCardContainer {
  mortality: IMortalityWithSupplementaryData[];
  selectedAnimal: ISurveyCritter;
  handleDelete: (selectedMortality: string, critterbase_critter_id: string) => Promise<void>;
}
/**
 * Returns accordion cards for displaying animal mortality details on the animal profile page
 *
 * @param {IAnimalMortalityCardContainer} props
 * @return {*}
 */
export const AnimalMortalityCardContainer = (props: IAnimalMortalityCardContainer) => {
  const { mortality, selectedAnimal, handleDelete } = props;

  const [selectedMortality, setSelectedMortality] = useState<string | null>(null);
  const [mortalityAnchorEl, setMortalityAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [mortalityForDelete, setMortalityForDelete] = useState<boolean>();

  const { projectId, surveyId } = useSurveyContext();

  return (
    <>
      {/* 3 DOT ACTION MENU */}
      {selectedMortality && (
        <Menu
          sx={{ pb: 2 }}
          open={Boolean(mortalityAnchorEl)}
          onClose={() => setMortalityAnchorEl(null)}
          anchorEl={mortalityAnchorEl}
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
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.critterbase_critter_id}/mortality/${selectedMortality}/edit`}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMortalityAnchorEl(null);
              setMortalityForDelete(true);
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}
      {/* DELETE CONFIRMATION DIALOG */}
      {mortalityForDelete && selectedMortality && (
        <YesNoDialog
          dialogTitle={'Delete mortality event?'}
          dialogText={`Are you sure you want to permanently delete this mortality? All information associated with
          the mortality will be deleted.`}
          yesButtonProps={{ color: 'error' }}
          yesButtonLabel={'Delete'}
          noButtonProps={{ color: 'primary', variant: 'outlined' }}
          noButtonLabel={'Cancel'}
          open={Boolean(mortalityForDelete)}
          onYes={() => {
            setMortalityForDelete(false);
            handleDelete(selectedMortality, selectedAnimal.critterbase_critter_id);
          }}
          onClose={() => setMortalityForDelete(false)}
          onNo={() => setMortalityForDelete(false)}
        />
      )}

      {mortality.length ? (
        mortality.map((mortality) => {
          /* MORTALITY DETAILS */
          return (
            <Accordion
              component={Paper}
              variant="outlined"
              disableGutters
              key={mortality.mortality_id}
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
                    <Typography fontWeight={700}>
                      {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, mortality.mortality_timestamp)}&nbsp;
                    </Typography>
                    {mortality.location?.latitude && mortality.location?.longitude && (
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          {mortality.location.latitude},&nbsp;
                          {mortality.location.longitude}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </AccordionSummary>
                <IconButton
                  sx={{ position: 'absolute', right: '24px' }}
                  edge="end"
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    setMortalityAnchorEl(event.currentTarget);
                    setSelectedMortality(mortality.mortality_id);
                  }}
                  aria-label="sample-site-settings">
                  <Icon path={mdiDotsVertical} size={1}></Icon>
                </IconButton>
              </Box>
              <AccordionDetails>
                <AnimalMortalityCardDetailsContainer mortality={mortality} />
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        /* NO MORTALITY RECORDS */
        <Box
          flex="1 1 auto"
          borderRadius="5px"
          minHeight="70px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor={grey[100]}>
          <Typography variant="body2" color="textSecondary">
            This animal has not been reported as deceased
          </Typography>
        </Box>
      )}
    </>
  );
};
