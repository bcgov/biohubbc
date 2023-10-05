import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

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
    <List disablePadding
      sx={{
        '& li:first-of-type': {
          paddingTop: 0
        },
        '& .MuiListItemText-root': {
          margin: 0
        }
      }}
    >
      {permit.permits?.map((item, index: number) => {
        return (
          <ListItem disableGutters divider key={index}>
            <ListItemText
              primary={'#' + item.permit_number}
              secondary={item.permit_type}
            >
            </ListItemText>
          </ListItem>
        );
      })}
      {!permit.permits.length && (
        <ListItem>
          <ListItemText primary="No permits"/>
        </ListItem>
      )}
    </List>
  );
};

export default Permits;
