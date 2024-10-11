import { mdiChevronDown, mdiDotsVertical, mdiMapMarker, mdiVectorLine, mdiVectorSquare } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { SamplingSiteListContent } from './accordion-details/SamplingSiteListContent';

export interface ISamplingSiteListSiteProps {
  sampleSite: IGetSampleLocationNonSpatialDetails;
  isChecked: boolean;
  handleSampleSiteMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => void;
  handleCheckboxChange: (sampleSiteId: number) => void;
}

/**
 * Renders a list item for a single sampling site.
 *
 * @param {ISamplingSiteListSiteProps} props
 * @return {*}
 */
export const SamplingSiteListSite = (props: ISamplingSiteListSiteProps) => {
  const { sampleSite, isChecked, handleSampleSiteMenuClick, handleCheckboxChange } = props;

  let icon;
  if (sampleSite.geometry_type === 'Point') {
    icon = { path: mdiMapMarker, title: 'Point sampling site' };
  } else if (sampleSite.geometry_type === 'LineString') {
    icon = { path: mdiVectorLine, title: 'Transect sampling site' };
  } else {
    icon = { path: mdiVectorSquare, title: 'Polygon sampling site' };
  }

  return (
    <Accordion
      disableGutters
      square
      slotProps={{
        transition: {
          mountOnEnter: true,
          unmountOnExit: true
        }
      }}
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid' + grey[300],
        '&:before': {
          display: 'none'
        }
      }}>
      <Box display="flex" alignItems="center" overflow="hidden">
        <AccordionSummary
          expandIcon={<Icon path={mdiChevronDown} size={1} />}
          aria-controls="panel1bh-content"
          sx={{
            flex: '1 1 auto',
            py: 0,
            pr: 8.5,
            pl: 0,
            height: 55,
            overflow: 'hidden',
            '& .MuiAccordionSummary-content': {
              flex: '1 1 auto',
              py: 0,
              pl: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }
          }}>
          <Stack
            flexDirection="row"
            alignItems="center"
            sx={{
              gap: 0.75,
              pl: 2,
              pr: 2,
              overflow: 'hidden'
            }}>
            <Checkbox
              edge="start"
              checked={isChecked}
              onClick={(event) => {
                event.stopPropagation();
                handleCheckboxChange(sampleSite.survey_sample_site_id);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />

            <Typography
              variant="body2"
              component="div"
              sx={{
                flex: '1 1 auto',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              {sampleSite.name}
            </Typography>
            <Box sx={{ minWidth: '20px', display: 'flex', alignItems: 'center' }}>
              <Icon size={0.8} color={grey[400]} title={icon.title} path={icon.path} />
            </Box>
          </Stack>
        </AccordionSummary>
        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
            handleSampleSiteMenuClick(event, sampleSite.survey_sample_site_id)
          }
          aria-label="sample-site-settings">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Box>
      <AccordionDetails
        sx={{
          pt: 0,
          pb: 1,
          pl: 1,
          pr: 0
        }}
      />
      <SamplingSiteListContent surveySampleSiteId={sampleSite.survey_sample_site_id} />
    </Accordion>
  );
};
