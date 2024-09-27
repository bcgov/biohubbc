import { mdiChevronDown, mdiTrashCanOutline } from '@mdi/js';
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
import { WarningSchema } from 'interfaces/useBioHubApi.interface';

export interface ISurveyBadDeploymentListItemProps {
  data: WarningSchema;
  handleDelete: (deploymentId: number) => void;
}

/**
 * Renders a list item for a single bad deployment record.
 *
 * @param {ISurveyBadDeploymentListItemProps {} props
 * @return {*}
 */
export const SurveyBadDeploymentListItem = (props: ISurveyBadDeploymentListItemProps) => {
  const { data, handleDelete } = props;

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
            <Checkbox edge="start" sx={{ py: 0 }} disabled={true} inputProps={{ 'aria-label': 'controlled' }} />
            <Box>
              <Stack gap={1} direction="row">
                <Typography
                  component="div"
                  title="Device ID"
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    flex: '1 1 auto',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  Unknown Deployment
                </Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary" title="Animal">
                Something went wrong...
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={() => handleDelete(data.data.deployment_id as number)}
          aria-label="deployment-settings">
          <Icon path={mdiTrashCanOutline} size={1}></Icon>
        </IconButton>
      </Box>
      <AccordionDetails sx={{ mt: 0, pt: 0 }}>
        <List
          disablePadding
          sx={{
            mx: 4.5,
            '& .MuiListItemText-primary': {
              typography: 'body2',
              pt: 1
            }
          }}>
          <Box width="100%" display="flex" justifyContent="space-between" p={0}>
            <Typography component="dt" variant="subtitle2" color="error">
              Deployment&nbsp;{data.data.bctw_deployment_id as string}&nbsp;does not exist. You can remove this
              deployment from your Survey.
            </Typography>
          </Box>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
