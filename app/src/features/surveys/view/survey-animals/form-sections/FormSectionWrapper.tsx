import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Divider, Grid, IconButton, PaperProps, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import { useFormikContext } from 'formik';
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
    <>
      <Divider sx={{ mt: 4, mb: 3 }} />
      <Box component="fieldset">
        <Typography component="legend">{title}</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            mt: -1,
            mb: 3
          }}>
          {titleHelp}
        </Typography>
        {childs.map((child, idx) => (
          <Card
            key={child.key}
            variant="outlined"
            {...innerPaperProps}
            sx={{
              '& + div': {
                mt: 1
              },
              '& + button': {
                mt: 2
              }
            }}>
            <CardHeader
              title={
                <>
                  {addedSectionTitle ? (
                    <>{childs.length > 1 ? `${addedSectionTitle} (${idx + 1})` : `${addedSectionTitle}`}</>
                  ) : null}
                </>
              }
              action={
                <>
                  {handleRemoveSection && childs.length >= 1 ? (
                    <IconButton sx={{ ml: 'auto', height: 40, width: 40 }} onClick={() => handleRemoveSection(idx)}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  ) : null}
                </>
              }
              sx={{
                py: 1.5,
                background: grey[100],
                fontSize: '0.875rem'
              }}></CardHeader>
            <CardContent
              sx={{
                pb: '16px !important'
              }}>
              <Grid container spacing={2}>
                {child}
              </Grid>
            </CardContent>
          </Card>
        ))}
        {showBtn ? (
          <Button
            onClick={handleAddSection}
            startIcon={<Icon path={mdiPlus} size={1} />}
            variant="outlined"
            disabled={disableAddBtn || !values.general.taxon_id}
            color="primary">
            {btnLabel}
          </Button>
        ) : null}
      </Box>
    </>
  );
};

export default FormSectionWrapper;