import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

export interface IHorizontalSplitFormComponentProps {
  /**
   * The title of the section
   *
   * @type {string}
   * @memberof IHorizontalSplitFormComponentProps
   */
  title: string;
  /**
   * The description for the section (optional)
   *
   * @type {string}
   * @memberof IHorizontalSplitFormComponentProps
   */
  summary?: string;
  /**
   * The form component to render
   *
   * @type {ReactElement}
   * @memberof IHorizontalSplitFormComponentProps
   */
  component: ReactElement;
}

/**
 * Shared component for various survey sections
 *
 * @return {*}
 */
const HorizontalSplitFormComponent = (props: IHorizontalSplitFormComponentProps) => {
  const { title, summary, component } = props;

  return (
    <Grid container spacing={3}>
      <Grid item sx={{ pb: 3 }} xs={12} lg={4}>
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        {summary && (
          <Box pt={1.25} maxWidth="55ch">
            <Typography variant="body1" color="textSecondary">
              {summary}
            </Typography>
          </Box>
        )}
      </Grid>
      <Grid item xs={12} lg={8}>
        {component}
      </Grid>
    </Grid>
  );
};

export default HorizontalSplitFormComponent;
