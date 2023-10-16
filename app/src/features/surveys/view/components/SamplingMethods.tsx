import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

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
    surveyData: { site_selection, blocks }
  } = surveyForViewData;

  return (
    <Box component="dl">
      <Box className="row">
        <Typography component="dt">Site Selection Strategies</Typography>
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
          }}>
          {site_selection.strategies?.map((item, index: number) => {
            return (
              <Typography component="dd" key={index}>
                {item}
              </Typography>
            );
          })}
        </Box>
      </Box>

      {site_selection.stratums.length > 0 && (
        <Box className="row" component="section">
          <Typography component="h4">Stratums</Typography>
          <List disablePadding>
            {site_selection.stratums?.map((item, index: number) => {
              return (
                <ListItem
                  key={index}
                  sx={{
                    p: 0,
                    '& + .MuiListItem-root': {
                      mt: 1
                    }
                  }}>
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
          </List>
        </Box>
      )}

      {blocks.length > 0 && (
        <Box component="section" className="row">
          <Typography component="h4">Blocks</Typography>
          <List disablePadding>
            {blocks?.map((item, index: number) => {
              return (
                <ListItem
                  key={index}
                  sx={{
                    p: 0,
                    '& + .MuiListItem-root': {
                      mt: 1
                    }
                  }}>
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
          </List>
        </Box>
      )}
    </Box>
  );
};

export default SamplingMethods;
