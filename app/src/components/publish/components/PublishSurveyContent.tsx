import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { applyFeatureToggle, CHILDREN, PARENTS } from '../featureDependencies';
import { PUBLISH_FEATURE_TYPE_LABELS, PUBLISH_FEATURE_TYPES, PublishFeatureType } from '../publishFeatureTypes';
import { ISubmitSurvey } from '../PublishSurveyDialog';

/**
 * Survey Publish Content.
 *
 * @return {*}
 */
interface IPublishSurveyContentProps {
  availableFeatureTypes: PublishFeatureType[];
}

const PublishSurveyContent = (props: IPublishSurveyContentProps) => {
  const { values, setFieldValue } = useFormikContext<ISubmitSurvey>();
  const parentFeatureTypes = Object.values(PUBLISH_FEATURE_TYPES)
    .filter((featureType) => !PARENTS[featureType]?.length)
    .filter((featureType) => props.availableFeatureTypes.includes(featureType))
    .sort((featureTypeA, featureTypeB) =>
      PUBLISH_FEATURE_TYPE_LABELS[featureTypeA].localeCompare(PUBLISH_FEATURE_TYPE_LABELS[featureTypeB], undefined, {
        sensitivity: 'base'
      })
    );
  const renderFeatureRow = (featureType: PublishFeatureType, depth = 0) => {
    const childFeatureTypes = (CHILDREN[featureType] || []).filter((childFeatureType) =>
      props.availableFeatureTypes.includes(childFeatureType)
    );

    const nestedRowSpacingSx =
      depth === 1
        ? {
            my: -0.1,
            mt: -1.5,
            '& .MuiTypography-root': { lineHeight: 1.3 },
            '& .MuiCheckbox-root': { mr: 0.5, py: '4px' }
          }
        : depth > 1
          ? {
              my: -0.15,
              '& .MuiTypography-root': { lineHeight: 1.25 },
              '& .MuiCheckbox-root': { mr: 0.5, py: '3px' }
            }
          : {};

    return (
      <Box key={featureType} sx={{ mb: depth === 0 && childFeatureTypes.length ? 0.35 : 0 }}>
        <FormControlLabel
          sx={{
            ml: `${4 + depth * 32}px`,
            '& .MuiCheckbox-root': { mr: 0.5 },
            ...nestedRowSpacingSx
          }}
          label={PUBLISH_FEATURE_TYPE_LABELS[featureType]}
          control={
            <Checkbox
              checked={values.featureTypes.includes(featureType)}
              onClick={() => {
                const isChecked = values.featureTypes.includes(featureType);
                const nextSelection = applyFeatureToggle(featureType, !isChecked, values.featureTypes);
                setFieldValue('featureTypes', nextSelection);
              }}
              name={`featureTypes.${featureType}`}
            />
          }
        />

        {childFeatureTypes.map((childFeatureType) => renderFeatureRow(childFeatureType, depth + 1))}
      </Box>
    );
  };
  const sectionLayoutSx = {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(240px, 300px) 1fr'
    },
    columnGap: 6,
    rowGap: 2,
    alignItems: 'start'
  } as const;

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
          <a
            href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/data-information-security"
            target="_blank">
            Species and Ecosystems Data and Information Security (SEDIS) Policy.
          </a>
        </Typography>
      </Box>

      <Stack gap={4}>
        <Box component="section" sx={sectionLayoutSx}>
          <Box>
            <Typography component="h3" sx={{ fontWeight: 700 }}>
              Data
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Survey data included in this publish request.
            </Typography>
          </Box>
          <FormGroup>{parentFeatureTypes.map((parentFeatureType) => renderFeatureRow(parentFeatureType))}</FormGroup>
        </Box>

        <Box component="section" sx={sectionLayoutSx}>
          <Box>
            <Typography component="h3" sx={{ fontWeight: 700 }}>
              Agreements
            </Typography>
            <Typography variant="body1" color="textSecondary">
              You must acknowledge your responsibilities as a data contributor.
            </Typography>
          </Box>
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

        <Box component="section" sx={sectionLayoutSx}>
          <Box>
            <Typography component="h3" sx={{ fontWeight: 700 }}>
              Additional Information
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Information about this survey that data stewards should be aware of, including any reasons why this survey
              should be secured.
            </Typography>
          </Box>
          <CustomTextField
            name="submissionComment"
            label=""
            other={{
              placeholder: 'Submission comment',
              multiline: true,
              rows: 3
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default PublishSurveyContent;
