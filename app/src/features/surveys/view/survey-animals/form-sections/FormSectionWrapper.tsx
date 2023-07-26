import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Grid, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import React from 'react';

interface FormSectionWrapperProps {
  title: string;
  titleHelp: string;
  btnText: string;
  handleBtnClick: () => void;
  //Input elements to render in section
  children: JSX.Element[];
}
const FormSectionWrapper = ({ title, titleHelp, children, handleBtnClick, btnText }: FormSectionWrapperProps) => (
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
      <Grid item>
        <Button
          onClick={handleBtnClick}
          startIcon={<Icon path={mdiPlus} size={1} />}
          variant="outlined"
          size="small"
          color="primary">
          {btnText}
        </Button>
      </Grid>
    </Grid>
  </>
);

export default FormSectionWrapper;
