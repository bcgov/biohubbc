import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip'; // Import Chip component
import Collapse from '@mui/material/Collapse';
import { green, grey } from '@mui/material/colors'; // Import green color
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface IMethodStandardsCardAttributeProps {
  name: string;
  description: string;
  unit?: string; // Add unit prop
  options?: { name: string; description: string }[];
}

export const MethodStandardsCardAttribute = (props: IMethodStandardsCardAttributeProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedOptions, setCollapsedOptions] = useState<{ [key: string]: boolean }>({});

  const { name, description, unit, options } = props;

  const handleOptionClick = (name: string) => {
    setCollapsedOptions((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <Paper sx={{ bgcolor: grey[200], p: 2, border: `1px solid ${grey[400]}`, position: 'relative' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsCollapsed((prev) => !prev)}>
        <Typography variant="body2" fontWeight={700}>
          {name}
        </Typography>
        {unit && (
          <Chip
            label={unit.toUpperCase()} // Capitalize the text
            sx={{
              bgcolor: green[800], // Forest green background
              color: 'white', // White text
              fontWeight: 'bold', // Bold text
              textTransform: 'uppercase', // Capitalize text
              fontSize: '0.75rem', // Smaller font size
              minWidth: 'auto', // Adjust width to fit the content
              display: 'inline-flex', // Adjust display to inline-flex
              padding: '2px 6px', // Adjust padding
              height: '24px', // Consistent height
              marginLeft: 'auto' // Push to the right
            }}
            size="small"
          />
        )}
      </Box>
      <Collapse in={!isCollapsed}>
        <Typography variant="caption" color="textSecondary">
          {description || 'No description available'}
        </Typography>
        {options?.map((option) => (
          <Paper key={option.name} sx={{ p: 1, mt: 1, bgcolor: grey[200], border: `1px solid ${grey[400]}` }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => handleOptionClick(option.name)}>
              <Typography variant="body2" fontWeight={600}>
                {option.name}
              </Typography>
              <Icon
                path={collapsedOptions[option.name] ? mdiChevronUp : mdiChevronDown}
                size={0.5}
                style={{ marginLeft: 8 }}
              />
            </Box>
            <Collapse in={collapsedOptions[option.name]}>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {option.description || 'No description available'}
              </Typography>
            </Collapse>
          </Paper>
        ))}
      </Collapse>
    </Paper>
  );
};
