import { mdiChevronDown, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SamplingSiteListMethod } from 'features/surveys/observations/sampling-sites/list/SamplingSiteListMethod';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';

export interface ISamplingSiteListSiteProps {
  sampleSite: IGetSampleLocationDetails;
  isChecked: boolean;
  handleSampleSiteMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => void;
  handleCheckboxChange: (sampleSiteId: number) => void;
}

export const SamplingSiteListSite = (props: ISamplingSiteListSiteProps) => {
  const { sampleSite, isChecked, handleSampleSiteMenuClick, handleCheckboxChange } = props;

  return (
    <Accordion
      disableGutters
      square
      key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
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
          </Stack>
        </AccordionSummary>
        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
            handleSampleSiteMenuClick(event, sampleSite.survey_sample_site_id)
          }
          aria-label="sample-site-settings">
          <Icon path={mdiDotsVertical} size={1}></Icon>
        </IconButton>
      </Box>
      <AccordionDetails
        sx={{
          pt: 0,
          px: 2
        }}>
        <List
          disablePadding
          sx={{
            '& .MuiListItemText-primary': {
              typography: 'body2'
            }
          }}>
          {sampleSite.sample_methods?.map((sampleMethod) => {
            return <SamplingSiteListMethod sampleMethod={sampleMethod} />;
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
