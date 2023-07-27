import { Grid, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import React from 'react';
import AddSectionBtn from '../AddSectionBtn';

interface FormSectionWrapperProps {
  title: string;
  titleHelp: string;
  btnLabel?: string;
  handleAddSection?: () => void;
  //Input elements to render in section
  children: JSX.Element[] | JSX.Element;
}
const FormSectionWrapper = ({ title, titleHelp, children, handleAddSection, btnLabel }: FormSectionWrapperProps) => (
  <>
    <Typography component="legend">
      <HelpButtonTooltip content={titleHelp}>{title}</HelpButtonTooltip>
    </Typography>
    <Grid container spacing={3} mb={3}>
      {children}
    </Grid>
    {btnLabel && handleAddSection && <AddSectionBtn label={btnLabel} handleAdd={handleAddSection} />}
  </>
);

export default FormSectionWrapper;
