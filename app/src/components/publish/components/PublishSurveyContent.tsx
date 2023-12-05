import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { ISubmitSurvey } from '../PublishSurveyDialog';

export interface IPublishSurveyIdContentProps {
  publishDate: string | unknown;
}

/**
 * Survey Publish Content.
 *
 * @return {*}
 */
const PublishSurveyContent = (props: IPublishSurveyIdContentProps) => {
  const { values, setFieldValue } = useFormikContext<ISubmitSurvey>();

  return (
    <Stack
      gap={4}
      divider={<Divider flexItem></Divider>}
      sx={{
        maxWidth: '800px'
      }}>
      <Box
        component="section"
        sx={{
          '& p + p': {
            marginTop: 2
          }
        }}>
        <Typography variant="body1" color="textSecondary">
          Published data submitted as part of this survey may be secured according to the{' '}
          {/* eslint-disable-next-line react/jsx-no-target-blank */}
          <a
            href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/data-information-security"
            target="_blank">
            Species and Ecosystems Data and Information Security (SEDIS) Policy
          </a>
          .
        </Typography>
      </Box>

      <Stack gap={4}>
        <Box component="fieldset">
          <Typography component="legend">Additional Information</Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: -0.75, mb: 3 }}>
            Information about this survey that data stewards should be aware of, including any reasons why this survey
            should be secured.
          </Typography>
          <CustomTextField
            name="additionalInformation"
            label=""
            other={{
              placeholder: 'Additional information, security concerns, etc.',
              multiline: true,
              rows: 3
            }}
          />
        </Box>
        <Box component="fieldset">
          <Typography component="legend">Agreements</Typography>
          <FormGroup>
            <FormControlLabel
              slotProps={{ typography: { variant: 'body1' } }}
              sx={{
                mt: -0.5,
                mb: 1.5,
                ml: '4px',
                '& .MuiCheckbox-root': {
                  mr: 0.5
                }
              }}
              label="I am authorized to publish information and data for this survey."
              control={
                <Checkbox
                  checked={values.agreement1}
                  onClick={() => setFieldValue('agreement1', !values.agreement1)}
                  name="agreement1"
                />
              }
            />
            <FormControlLabel
              sx={{
                ml: '4px',
                mb: 3,
                alignItems: 'flex-start',
                '& .MuiCheckbox-root': {
                  mt: '-10px',
                  mr: 0.5
                }
              }}
              label={
                <Typography variant="body1">
                  All published data for this survey meets or exceed the{' '}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a href="#" target="_blank">
                    Freedom of Information and Protection of Privacy Act (FOIPPA)
                  </a>{' '}
                  requirements.
                </Typography>
              }
              control={
                <Checkbox
                  checked={values.agreement2}
                  onClick={() => setFieldValue('agreement2', !values.agreement2)}
                  name="agreement2"
                />
              }
            />
            <FormControlLabel
              sx={{
                ml: '4px',
                alignItems: 'flex-start',
                '& .MuiCheckbox-root': {
                  mt: '-10px',
                  mr: 0.5
                }
              }}
              label={
                <Typography variant="body1">
                  All data and information for this survey has been collected legally, and in accordance with Section 1
                  of the{' '}
                  <a
                    href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/data-information-security"
                    target="_blank"
                    rel="noreferrer">
                    {' '}
                    Species and Ecosystems Data and Information Security (SEDIS)
                  </a>{' '}
                  procedures.
                </Typography>
              }
              control={
                <Checkbox
                  checked={values.agreement3}
                  onClick={() => setFieldValue('agreement3', !values.agreement3)}
                  name="agreement3"
                />
              }
            />
          </FormGroup>
        </Box>
      </Stack>
    </Stack>
  );
};

export default PublishSurveyContent;
