import { Grid, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import React from 'react';

interface FormSectionWrapperProps {
  title: string;
  titleHelp: string;
  //Input elements to render in section
  children: JSX.Element[];
}
const FormSectionWrapper = ({ title, titleHelp, children }: FormSectionWrapperProps) => (
  <>
    <Typography component="legend">
      <HelpButtonTooltip content={titleHelp}>{title}</HelpButtonTooltip>
    </Typography>
    <Grid container spacing={3}>
      {children.map((child, index) => {
        return (
          <Grid item xs={6}>
            {child}
          </Grid>
        );
      })}
    </Grid>
  </>
);

export default FormSectionWrapper;
