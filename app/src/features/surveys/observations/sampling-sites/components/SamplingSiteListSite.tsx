import { mdiChevronDown, mdiDotsVertical, mdiMapMarker, mdiVectorLine, mdiVectorSquare } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import blue from '@mui/material/colors/blue';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SamplingSiteListMethod } from 'features/surveys/observations/sampling-sites/components/SamplingSiteListMethod';
import { SamplingStratumChips } from 'features/surveys/sampling-information/sites/edit/form/SamplingStratumChips';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';

export interface ISamplingSiteListSiteProps {
  sampleSite: IGetSampleLocationDetails;
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

  const staticLayers: IStaticLayer[] = [
    {
      layerName: 'Sample Sites',
      layerOptions: { color: blue[500], fillColor: blue[500] },
      features: [
        {
          id: sampleSite.survey_sample_site_id,
          key: `sampling-site-${sampleSite.survey_sample_site_id}`,
          geoJSON: sampleSite.geojson
        }
      ]
    }
  ];

  let icon;
  if (sampleSite.geojson.geometry.type === 'Point') {
    icon = { path: mdiMapMarker, title: 'Point sampling site' };
  } else if (sampleSite.geojson.geometry.type === 'LineString') {
    icon = { path: mdiVectorLine, title: 'Transect sampling site' };
  } else {
    icon = { path: mdiVectorSquare, title: 'Polygon sampling site' };
  }

  return (
    <Accordion
      disableGutters
      square
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
          <Icon path={mdiDotsVertical} size={1}></Icon>
        </IconButton>
      </Box>
      <AccordionDetails
        sx={{
          pt: 0,
          pb: 1,
          pl: 1,
          pr: 0
        }}>
        {sampleSite.stratums && sampleSite.stratums.length > 0 && (
          <Box display="flex" alignItems="center" color="textSecondary" py={1} px={1}>
            <SamplingStratumChips sampleSite={sampleSite} />
          </Box>
        )}
        <List
          disablePadding
          sx={{
            mx: 1.5,
            '& .MuiListItemText-primary': {
              typography: 'body2',
              pt: 1
            }
          }}>
          {sampleSite.sample_methods?.map((sampleMethod, index) => {
            return (
              <SamplingSiteListMethod
                sampleMethod={sampleMethod}
                key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}-${index}`}
              />
            );
          })}
        </List>
        <Box height="250px" flex="1 1 auto" mx={1} m={2}>
          <SurveyMap staticLayers={staticLayers} isLoading={false} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
