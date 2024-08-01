import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Collapse, Paper, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useState } from 'react';
import { MethodStandardsCardAttribute } from './MethodStandardsCardAttribute';

interface IMethodStandardCard {
  name: string;
  description: string;
  quantitativeAttributes: Attribute[];
  qualitativeAttributes: QualitativeAttribute[];
  small?: boolean;
}

interface Attribute {
  name: string;
  description: string;
  unit?: string;
}

interface QualitativeAttribute {
  name: string;
  description: string;
  options: {
    name: string;
    description: string;
  }[];
}

/**
 * Card to display method information for species standards
 *
 * @return {*}
 */
const MethodStandardCard = (props: IMethodStandardCard) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Paper sx={{ bgcolor: grey[200], px: 3, py: 2, flex: '1 1 auto' }} elevation={0}>
      {/* METHOD */}
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
            },
            textDecoration: !isCollapsed ? 'underline' : 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}>
          {props.name}
        </Typography>
        <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />
      </Box>
      <Collapse in={!isCollapsed}>
        <Typography variant="body1" color="textSecondary" my={1}>
          {props.description}
        </Typography>

        {/* QUANTITATIVE ATTRIBUTES */}
        <Stack gap={2}>
          {props.quantitativeAttributes?.map((attribute) => (
            <MethodStandardsCardAttribute
              key={attribute.name}
              name={attribute.name}
              description={attribute.description}
              unit={attribute.unit} // Pass unit prop
            />
          ))}
          {props.qualitativeAttributes?.map((attribute) => (
            <MethodStandardsCardAttribute
              key={attribute.name}
              name={attribute.name}
              description={attribute.description}
              options={attribute.options}
            />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default MethodStandardCard;
