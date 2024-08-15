import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useContext } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData || !codesContext.codesDataLoader.data) {
    return <></>;
  }

  const {
    surveyData: { survey_details, species }
  } = surveyForViewData;

  const codes = codesContext.codesDataLoader.data;

  const surveyTypes: string | null =
    codes.type
      .filter((code) => survey_details.survey_types.includes(code.id))
      .map((code) => code.name)
      .join(', ') || null;

  return (
    <Box component="dl">
      <Box className="row">
        <Typography component="dt">Type</Typography>
        <Typography component="dd">{surveyTypes ?? 'No Types'}</Typography>
      </Box>

      <Box className="row">
        <Typography component="dt">Timeline</Typography>
        <Typography component="dd" data-testid="survey_timeline">
          {survey_details.end_date ? (
            <>
              {getFormattedDateRangeString(
                DATE_FORMAT.MediumDateFormat,
                survey_details.start_date,
                survey_details.end_date
              )}
            </>
          ) : (
            <>
              <span>Start Date: </span>
              {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, survey_details.start_date)}
            </>
          )}
        </Typography>
      </Box>

      <Box className="row">
        <Typography component="dt">Species of Interest</Typography>
        <Typography component="dd">
          {species.focal_species?.map((focalSpecies: ITaxonomy) => {
            return (
              <Typography
                component="span"
                key={focalSpecies.tsn}
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mr: 1.25,
                  '&::after': {
                    content: "';'",
                    position: 'absolute',
                    top: 0
                  },
                  '&:last-child::after': {
                    display: 'none'
                  }
                }}
                data-testid="focal_species">
                <Typography component="span" sx={{ display: 'inline' }}>
                  {focalSpecies.commonNames.join(',')}
                </Typography>{' '}
                <Typography component="span" sx={{ display: 'inline' }} fontStyle="italic">
                  ({focalSpecies.scientificName})
                </Typography>
              </Typography>
            );
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default SurveyGeneralInformation;
