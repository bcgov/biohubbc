import Box from '@mui/material/Box';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import Typography from '@mui/material/Typography';
import { grey } from '@mui/material/colors';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const Permits = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData || !codesContext.codesDataLoader.data) {
    return <></>;
  }

  const {
    surveyData: { permit }
  } = surveyForViewData;

  return (
    <>
    
    <Box 
      component="dl"
      sx={{
        '& .row': {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: {sm: 'wrap', md: 'nowrap'},
          py: 1,
          borderTop: '1px solid' + grey[300]
        },
        '& dt': {
          flex: '1 1 auto',
          maxWidth: {sm: '100%', md: '25%'}
        }
      }}
    >
      {permit.permits?.map((item, index: number) => {
        return (
          <Box className="row" key={index}>
            <Typography component="dt">
            {'#' + item.permit_number}
            </Typography>
            <Typography component="dd">
              {item.permit_type}
            </Typography>
          </Box>
        );
      })}
      {!permit.permits.length && (
        <Box>
          <Typography>No Permits</Typography>
        </Box>
      )}
    </Box>
    </>
  );
};

export default Permits;
