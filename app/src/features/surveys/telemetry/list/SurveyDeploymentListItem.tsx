import { mdiChevronDown, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PulsatingDot } from 'components/misc/PulsatingDot';
import dayjs from 'dayjs';
import { SurveyDeploymentListItemDetails } from 'features/surveys/telemetry/list/SurveyDeploymentListItemDetails';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IAnimalDeployment } from 'interfaces/useTelemetryApi.interface';

export interface ISurveyDeploymentListItemProps {
  animal: ICritterSimpleResponse;
  deployment: Omit<IAnimalDeployment, 'frequency_unit'> & { frequency_unit: string | null };
  isChecked: boolean;
  handleDeploymentMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: number) => void;
  handleCheckboxChange: (deploymentId: number) => void;
}

/**
 * Renders a list item for a single deployment record.
 *
 * @param {ISurveyDeploymentListItemProps} props
 * @return {*}
 */
export const SurveyDeploymentListItem = (props: ISurveyDeploymentListItemProps) => {
  const { animal, deployment, isChecked, handleDeploymentMenuClick, handleCheckboxChange } = props;

  const isDeploymentOver =
    deployment.critterbase_end_mortality_id ||
    deployment.critterbase_end_capture_id ||
    dayjs(`${deployment.attachment_end_date} ${deployment.attachment_end_time}`).isBefore(dayjs());

  return (
    <Accordion
      disableGutters
      square
      sx={{
        borderRadius: '4px',
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
            pr: 7,
            pl: 0,
            height: 75,
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
            alignItems="flex-start"
            sx={{
              gap: 0.75,
              pl: 2,
              pr: 2,
              overflow: 'hidden'
            }}>
            <Checkbox
              edge="start"
              checked={isChecked}
              sx={{ py: 0 }}
              onClick={(event) => {
                event.stopPropagation();
                handleCheckboxChange(deployment.deployment_id);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Box>
              <Stack gap={1} direction="row">
                <Typography
                  component="div"
                  title="Device ID"
                  variant="body2"
                  sx={{
                    flex: '1 1 auto',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {deployment.device_id}
                </Typography>
                <Typography component="span" variant="body2" color="textSecondary" title="Device frequency">
                  {deployment.frequency}&nbsp;{deployment.frequency_unit}
                </Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary" title="Animal">
                {animal.animal_id}
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>

        {!isDeploymentOver && (
          <Box
            position="absolute"
            right={'26%'}
            alignItems="center"
            justifyContent="center"
            display="flex"
            title="Device is active">
            <PulsatingDot color={green} size="10px" time={8000} />
          </Box>
        )}

        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
            handleDeploymentMenuClick(event, deployment.deployment_id)
          }
          aria-label="deployment-settings">
          <Icon path={mdiDotsVertical} size={1}></Icon>
        </IconButton>
      </Box>
      <AccordionDetails sx={{ mt: 0, pt: 0 }}>
        <List
          disablePadding
          sx={{
            mx: 4.5,
            '& .MuiListItemText-primary': {
              typography: 'body2',
              pt: 1,
            }
          }}>
          <SurveyDeploymentListItemDetails deployment={deployment} />
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
