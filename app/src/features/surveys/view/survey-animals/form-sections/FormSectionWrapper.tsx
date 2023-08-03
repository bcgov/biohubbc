import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Grid, IconButton, Typography } from '@mui/material';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { useFormikContext } from 'formik';
import React from 'react';
import { IAnimal } from '../animal';

interface FormSectionWrapperProps {
  title: string; // Section title ie: General / Capture etc
  titleHelp: string; // Text for help toolip
  btnLabel?: string; // Add section btn label ie: 'Add Capture Event'
  handleAddSection?: () => void; // function to call when add btn selected
  handleRemoveSection?: (index: number) => void; // function to call when "X" btn selected
  children: JSX.Element[] | JSX.Element;
  inlineChildren?: JSX.Element[]; //Additional elements to display in between title and X button (ie. like toggles),
  maxSections?: number;
}
/**
 * Wrapper for rendering the section inputs with additional controls for
 * adding deleting form sections/inputs.
 *
 * params { FormSectionWrapperProps }
 * returns {*}
 */

const FormSectionWrapper = ({
  title,
  titleHelp,
  children,
  handleAddSection,
  handleRemoveSection,
  btnLabel,
  maxSections
}: FormSectionWrapperProps) => {
  const { values } = useFormikContext<IAnimal>();
  //For convienence, vs rendering duplicated components for children and children[]
  const childs = Array.isArray(children) ? children : [children];

  const getTitle = (titleIndex: number) => (
    <Box display="flex" flexDirection="row">
      <Typography component="legend">
        <HelpButtonTooltip content={titleHelp}>
          {childs.length > 1 ? `${title} (${titleIndex + 1})` : `${title}`}
        </HelpButtonTooltip>
      </Typography>
      {handleRemoveSection && childs.length >= 1 ? (
        <IconButton sx={{ ml: 'auto', height: 40, width: 40 }} onClick={() => handleRemoveSection(titleIndex)}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      ) : null}
    </Box>
  );

  return (
    <Box mb={2}>
      {childs.length < 2 ? getTitle(0) : null}
      {childs.map((child, idx) => (
        <div key={`fs-section-wrapper-${idx}`}>
          {childs.length >= 2 && getTitle(idx)}
          <Grid container spacing={2} mb={2}>
            {child}
          </Grid>
        </div>
      ))}
      {btnLabel && handleAddSection && (maxSections === undefined || childs.length < maxSections) ? (
        <Button
          onClick={handleAddSection}
          startIcon={<Icon path={mdiPlus} size={1} />}
          variant="outlined"
          size="small"
          disabled={!values.general.taxon_id}
          color="primary">
          {btnLabel}
        </Button>
      ) : null}
    </Box>
  );
};

export default FormSectionWrapper;
