import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export interface IHorizontalSplitFormComponentProps {
  title: string;
  summary: string;
  component: any;
}

/**
 * Shared component for various survey sections
 *
 * @return {*}
 */
const HorizontalSplitFormComponent: React.FC<IHorizontalSplitFormComponentProps> = (props) => {
  const { title, summary, component } = props;

  return (
    <>
      <Box width="100%" display="flex" flexWrap="nowrap">
        <Box width="30%" p={5}>
          <Typography variant="h2">{title}</Typography>
          <Box pt={3}>
            <Typography variant="body2">{summary}</Typography>
          </Box>
        </Box>
        <Box width="70%" p={5}>
          {component}
        </Box>
      </Box>
    </>
  );
};

export default HorizontalSplitFormComponent;
