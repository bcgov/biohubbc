import { mdiChevronDown, mdiDotsVertical, mdiPencilOutline, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';
import CaptureCardDetails from './CaptureCardDetails';

/**
 * Returns accordian cards for displaying animal capture details on the animal profile page
 *
 * @returns
 */
const AnimalCaptureCardContainer = () => {
  const critterbaseApi = useCritterbaseApi();

  const { critterDataLoader } = useAnimalPageContext();
  const [selectedCapture, setSelectedCapture] = useState<string | null>(null);
  const [captureAnchorEl, setCaptureAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [captureForDelete, setCaptureForDelete] = useState<boolean>();

  const { projectId, surveyId } = useSurveyContext();
  const { selectedAnimal } = useAnimalPageContext();

  if (!critterDataLoader.data) {
    return <SkeletonList />;
  }

  const captures = critterDataLoader.data.captures;

  const handleCaptureMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, captureId: string) => {
    setCaptureAnchorEl(event.currentTarget);
    setSelectedCapture(captureId);
  };

  const handleDelete = async () => {
    if (selectedCapture && selectedAnimal) {
      await critterbaseApi.capture.deleteCapture(selectedCapture);
      critterDataLoader.refresh(selectedAnimal.critterbase_critter_id);
    }
  };

  return (
    <>
      {selectedCapture && (
        <Menu
          sx={{ pb: 2 }}
          open={Boolean(captureAnchorEl)}
          onClose={() => setCaptureAnchorEl(null)}
          anchorEl={captureAnchorEl}
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
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal?.survey_critter_id}/capture/${selectedCapture}/edit`}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCaptureAnchorEl(null);
              setCaptureForDelete(true);
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCan} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {captureForDelete && (
        <YesNoDialog
          dialogTitle={'Delete capture event?'}
          dialogText={`Are you sure you want to permanently delete this capture? All information associated with
          the capture will be deleted.`}
          yesButtonProps={{ color: 'error' }}
          yesButtonLabel={'Delete'}
          noButtonProps={{ color: 'primary', variant: 'outlined' }}
          noButtonLabel={'Cancel'}
          open={Boolean(captureForDelete)}
          onYes={() => {
            setCaptureForDelete(false);
            handleDelete();
          }}
          onClose={() => setCaptureForDelete(false)}
          onNo={() => setCaptureForDelete(false)}
        />
      )}

      {captures.length ? (
        captures.map((capture, index) => {
          return (
            <Accordion
              component={Paper}
              variant="outlined"
              disableGutters
              elevation={1}
              key={`${capture.capture_id}-${index}`}
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
                      {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, capture.capture_timestamp)}&nbsp;
                    </Typography>
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        {capture.capture_location.longitude},&nbsp;
                        {capture.capture_location.latitude}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <IconButton
                  sx={{ position: 'absolute', right: '24px' }}
                  edge="end"
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                    handleCaptureMenuClick(event, capture.capture_id)
                  }
                  aria-label="sample-site-settings">
                  <Icon path={mdiDotsVertical} size={1}></Icon>
                </IconButton>
              </Box>
              <AccordionDetails>
                <CaptureCardDetails capture={capture} />
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Box
          flex="1 1 auto"
          borderRadius="5px"
          minHeight="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#fff">
          <Typography variant="body2" color="textSecondary">
            This animal has no captures
          </Typography>
        </Box>
      )}
    </>
  );
};

export default AnimalCaptureCardContainer;