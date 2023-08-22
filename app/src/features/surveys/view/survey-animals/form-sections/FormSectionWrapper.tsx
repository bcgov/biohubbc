import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Divider, Grid, IconButton, Paper, PaperProps, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import React from 'react';
import { IAnimal } from '../animal';

interface FormSectionWrapperProps {
  title: string; // Title ie: General / Capture Information etc
  titleHelp: string; // Text to display under title, subtitle text
  addedSectionTitle?: string; // Header to display inside added section
  btnLabel?: string; // Add section btn label ie: 'Add Capture Event'
  disableAddBtn?: boolean;
  handleAddSection?: () => void; // function to call when add btn selected
  handleRemoveSection?: (index: number) => void; // function to call when "X" btn selected
  innerPaperProps?: PaperProps;
  children: JSX.Element[] | JSX.Element;
  maxSections?: number;
}

/**
 * Wrapper for rendering the section inputs with additional controls for
 * adding deleting form sections/inputs.
 *
 * @param { FormSectionWrapperProps }
 * @return {*}
 *
 **/
const FormSectionWrapper = ({
  title,
  addedSectionTitle,
  titleHelp,
  children,
  handleAddSection,
  disableAddBtn,
  handleRemoveSection,
  innerPaperProps,
  btnLabel,
  maxSections
}: FormSectionWrapperProps) => {
  const { values } = useFormikContext<IAnimal>();
  //For convienence, vs rendering duplicated components for children and children[]
  const childs = Array.isArray(children) ? children : [children];
  const showBtn = btnLabel && handleAddSection && (maxSections === undefined || childs.length < maxSections);

  return (
    <Box component="fieldset" mt={2}>
      <Typography component="legend">
        {title}
        <br />
        <Typography component="span" variant="subtitle2" color="textSecondary">
          {titleHelp}
        </Typography>
      </Typography>
      {childs.map((child, idx) => (
        <Paper key={child.key} variant="outlined" sx={{ p: 2, mb: 2 }} {...innerPaperProps}>
          <Box display="flex" alignItems="center">
            {addedSectionTitle ? (
              <Typography fontWeight="bold">
                {childs.length > 1 ? `${addedSectionTitle} (${idx + 1})` : `${addedSectionTitle}`}
              </Typography>
            ) : null}
            {handleRemoveSection && childs.length >= 1 ? (
              <IconButton sx={{ ml: 'auto', height: 40, width: 40 }} onClick={() => handleRemoveSection(idx)}>
                <Icon path={mdiTrashCanOutline} size={1} />
              </IconButton>
            ) : null}
          </Box>
          <Grid container spacing={2}>
            {child}
          </Grid>
        </Paper>
      ))}
      {showBtn ? (
        <Button
          onClick={handleAddSection}
          startIcon={<Icon path={mdiPlus} size={1} />}
          variant="outlined"
          size="small"
          disabled={disableAddBtn || !values.general.taxon_id}
          color="primary">
          {btnLabel}
        </Button>
      ) : null}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default FormSectionWrapper;
