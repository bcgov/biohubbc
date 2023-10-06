import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { grey } from '@mui/material/colors';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SamplingMethods = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData || !codesContext.codesDataLoader.data) {
    return <></>;
  }

  const {
    surveyData: { site_selection }
  } = surveyForViewData;

  return (
    <Box 
      component="dl"
      sx={{
        '& .row': {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          py: 1,
          borderTop: '1px solid' + grey[300]
        },
        '& dt': {
          flex: '1 1 auto',
          maxWidth: {sm: '100%', md: '25%'}
        }
      }}
    >
      <Box className="row">
        <Typography component="dt">
          Site Selection Strategies
        </Typography>
        <Box
          flex="1 1 auto"
          sx={{
            '& dd': {
              position: 'relative',
              display: 'inline-block',
              mr: 0.75
            },
            '& dd:not(:last-child):after': {
              content: '","'
            }
          }}
        >
          {site_selection.strategies?.map((item, index: number) => {
            return (
              <Typography component="dd" key={index}>{item}</Typography>
            );
          })}
        </Box>
      </Box>

      <Box className="row">
        <Typography component="dt">
          Stratums
        </Typography>
        <Box
          flex="1 1 auto"
        >
          {site_selection.stratums?.map((item, index: number) => {
            return (
              <ListItem component="dd" key={index} 
                sx={{
                  p: 0,
                  '& + dd': {
                    mt: 1
                  }
                }}
              >
                <ListItemText
                  sx={{
                    m: 0
                  }} 
                  primary={item.name}
                  secondary={item.description}
                />
              </ListItem>
            );
          })}
        </Box>
      </Box>

    </Box>
  );
};

export default SamplingMethods;
