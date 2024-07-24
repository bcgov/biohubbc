import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EnvironmentQualitativeOption } from 'interfaces/useReferenceApi.interface';
import { useState } from 'react';

interface IEnvironmentStandardCard {
  label: string;
  description?: string;
  options?: EnvironmentQualitativeOption[];
  unit?: string;
  small?: boolean;
}

/**
 * Card to display environment information.
 *
 * @return {*}
 */
const EnvironmentStandardCard = (props: IEnvironmentStandardCard) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { small } = props;

  return (
    <Paper sx={{ bgcolor: grey[100], px: 3, py: 2, flex: '1 1 auto' }} elevation={0}>
      <Box
        display="flex"
        justifyContent="space-between"
        flex="1 1 auto"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsCollapsed(!isCollapsed)}>
        <Typography
          variant="h5"
          sx={{
            '&::first-letter': {
              textTransform: 'capitalize'
            }
          }}>
          {props.label}
        </Typography>
        <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />
      </Box>
      <Collapse in={!isCollapsed}>
        <Box my={2}>
          <Typography variant="body1" color="textSecondary">
            {props.description ? props.description : 'No description'}
          </Typography>
        </Box>
        <Stack gap={small ? 1 : 2}>
          {props.options?.map((option) => (
            <Card
              sx={{
                p: small ? 1 : 2,
                px: 2,
                bgcolor: grey[200],
                '&::first-letter': {
                  textTransform: 'capitalize'
                }
              }}
              elevation={0}
              key={`qualitative-option-${option.environment_qualitative_option_id}`}>
              <Typography variant="body1" fontWeight={700}>
                {option.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {option?.description}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default EnvironmentStandardCard;
