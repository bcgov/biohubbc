import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import MethodStandardCard from './MethodStandardsCard';

interface IMethodStandardsCardAttributeProps {
  name: string;
  description: string;
  options?: { name: string; description: string }[];
}
export const MethodStandardsCardAttribute = (props: IMethodStandardsCardAttributeProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  // const [collapsedOptions, setCollapsedOptions] = useState<{ [key: string]: boolean }>({});

  // const handleOptionClick = (name: string) => {
  //   setCollapsedOptions((prev) => ({
  //     ...prev,
  //     [name]: !prev[name]
  //   }));
  // };

  const { name, description, options } = props;

  return (
    <Paper sx={{ bgcolor: grey[200], p: 2 }}>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          setIsCollapsed((prev) => !prev);
        }}>
        {name}
      </Typography>
      <Collapse in={!isCollapsed}>
        <Typography variant="caption" color="textSecondary">
          {description}
        </Typography>
        {options?.map((option) => (
          <MethodStandardCard
            name={option.name}
            description={option.description}
            key={option.name}
            quantitativeAttributes={[]}
            qualitativeAttributes={[]}
          />
        ))}
        {/* {options?.map((option) => (
        <Box key={option.name} sx={{ cursor: 'pointer', py: 0.5 }} onClick={() => handleOptionClick(option.name)}>
          <Box display="flex" alignItems="center">
            <Icon
              path={collapsedOptions[option.name] ? mdiChevronDown : mdiChevronRight}
              size={0.5}
              style={{ marginRight: 4 }}
            />
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{
                flex: 1,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}>
              {option.name}
            </Typography>
          </Box>
          <Collapse in={collapsedOptions[option.name]}>
            <Typography variant="body2" color="textSecondary" sx={{ pl: 4, mt: 1 }}>
              {option.description}
            </Typography>
          </Collapse>
        </Box>
      )) || <Typography variant="body2">No options available</Typography>}
      <MethodStandards/> */}
      </Collapse>
    </Paper>
  );
};
