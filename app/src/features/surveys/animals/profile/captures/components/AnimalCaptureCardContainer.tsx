import { mdiChevronDown, mdiDotsVertical, mdiMapMarkerOutline, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';
import CaptureCardDetails from './CaptureCardDetails';

const AnimalCaptureCardContainer = () => {
  const { critterDataLoader } = useAnimalPageContext();
  const [selectedCapture, setSelectedCapture] = useState<string | null>(null);
  const [captureAnchorEl, setCaptureAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const { projectId, surveyId } = useSurveyContext();
  const { selectedAnimal } = useAnimalPageContext();

  if (!critterDataLoader.data) {
    return <CircularProgress size={40} />;
  }

  const captures = critterDataLoader.data.captures;

  const handleCaptureMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, captureId: string) => {
    setCaptureAnchorEl(event.currentTarget);
    setSelectedCapture(captureId);
  };

  return (
    <>
      {selectedCapture && (
        <Menu
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
        </Menu>
      )}

      {captures.map((capture) => {
        const [captureDate, captureTime] = capture.capture_timestamp.split(' ');

        return (
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              mx: 1,
              border: 'none',
              outline: 'none',
              '&.MuiAccordion-root:before': {
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
                  py: 2,
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
                <Stack direction="row" gap={0.5} display="flex" alignItems="center">
                  <Typography fontWeight={700}>
                    {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, captureDate)}&nbsp;
                  </Typography>
                  <Typography color="textSecondary">{captureTime}</Typography>
                  <Box display="flex" alignItems="flex-end">
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                      <Icon size={0.8} color={grey[400]} title="Capture location" path={mdiMapMarkerOutline} />
                    </Box>
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
      })}
    </>
  );
};

export default AnimalCaptureCardContainer;
