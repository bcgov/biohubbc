import { mdiChevronDown, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import { cyan } from '@mui/material/colors';
import { Box } from '@mui/system';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ANIMAL_SUBSECTIONS, IAnimalSubSections } from './animal';

interface AnimalListProps {
  onSelectCritter: (critter_id: string) => void;
  onSelectSection: (section: IAnimalSubSections) => void;
}

const AnimalList = ({ onSelectCritter, onSelectSection }: AnimalListProps) => {
  const bhApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const {
    //refresh: refreshCritters,
    load: loadCritters,
    data: critterData,
    isLoading
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId));

  if (!critterData) {
    loadCritters();
  }

  const selectSectionAction = (sectionName: IAnimalSubSections) => {
    onSelectSection(sectionName);
    switch (sectionName) {
      case SurveyAnimalsI18N.animalGeneralTitle:
        document.getElementById('general-animal-form')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case SurveyAnimalsI18N.animalMarkingTitle:
        document.getElementById('marking-animal-form')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case SurveyAnimalsI18N.animalFamilyTitle:
        document.getElementById('family-animal-form')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc'
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Animals
        </Typography>
        <Button
          sx={{
            mr: -1
          }}
          variant="contained"
          color="primary"
          component={RouterLink}
          to={'sampling'}
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add
        </Button>
      </Toolbar>

      {isLoading ? (
        // Skeleton Load
        <div>LOADING</div>
      ) : critterData ? (
        // Animal List
        critterData?.map((critter) => (
          <Accordion
            disableGutters
            onClick={() => onSelectCritter(critter.critter_id)}
            sx={{
              boxShadow: 'none',
              '&.Mui-expanded': {},
              '&.Mui-expanded .sampleSiteHeader': {
                background: cyan[50]
              }
            }}>
            <Box display="flex" overflow="hidden" alignItems="center" pr={1.5} className="sampleSiteHeader">
              <AccordionSummary
                expandIcon={<Icon path={mdiChevronDown} size={1} />}
                aria-controls="panel1bh-content"
                sx={{
                  flex: '1 1 auto',
                  overflow: 'hidden',
                  py: 0.25,
                  pr: 1.5,
                  gap: '16px',
                  '& .MuiAccordionSummary-content': {
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }
                }}>
                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', typography: 'body2' }}>
                  {critter.animal_id}
                </Typography>
              </AccordionSummary>
            </Box>
            <AccordionDetails
              sx={{
                py: 0
              }}>
              <List
                disablePadding
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem'
                  }
                }}>
                {ANIMAL_SUBSECTIONS.map((section) => (
                  <ListItem
                    dense
                    divider
                    button
                    onClick={() => {
                      selectSectionAction(section);
                      onSelectCritter(critter.critter_id);
                    }}>
                    <ListItemText>{section}</ListItemText>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        // No Animals to render
        <Box display="flex" flex="1 1 auto" height="100%" alignItems="center" justifyContent="center">
          <Typography variant="body2">No Animals</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnimalList;
