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
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';

export interface ISamplingSiteListSiteProps {
  deployment: IAnimalDeployment;
  isChecked: boolean;
  handleDeploymentMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: string) => void;
  handleCheckboxChange: (deploymentId: string) => void;
}

/**
 * Renders a list item for a single sampling site.
 *
 * @param {ISamplingSiteListSiteProps} props
 * @return {*}
 */
export const TelemetryListItem = (props: ISamplingSiteListSiteProps) => {
  const { deployment, isChecked, handleDeploymentMenuClick, handleCheckboxChange } = props;

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
                handleCheckboxChange(deployment.deployment_id);
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
              {deployment.device_id}
              <Typography component="span">
                {deployment.frequency}&nbsp;{deployment.frequency_unit}
              </Typography>
            </Typography>
          </Stack>
        </AccordionSummary>
        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
            handleDeploymentMenuClick(event, deployment.deployment_id)
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
        {/* {deployment.stratums && deployment.stratums.length > 0 && (
          <Box display="flex" alignItems="center" color="textSecondary" py={1} px={1}>
            <SamplingStratumChips deployment={deployment} />
          </Box>
        )} */}
        <List
          disablePadding
          sx={{
            mx: 1.5,
            '& .MuiListItemText-primary': {
              typography: 'body2',
              pt: 1
            }
          }}>
          {/* {deployment.sample_methods?.map((sampleMethod, index) => {
            return (
              <SamplingSiteListMethod
                sampleMethod={sampleMethod}
                key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}-${index}`}
              />
            );
          })} */}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
