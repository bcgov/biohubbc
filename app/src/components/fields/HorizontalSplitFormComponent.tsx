import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
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
    <Grid container spacing={3}>
      <Grid item xs={12} lg={4}>
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        <Box pt={2} pb={3} maxWidth="55ch">
          <Typography variant="body1" color="textSecondary">
            {summary}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} lg={8}>
        {component}
      </Grid>
    </Grid>
  );
};

export default HorizontalSplitFormComponent;
