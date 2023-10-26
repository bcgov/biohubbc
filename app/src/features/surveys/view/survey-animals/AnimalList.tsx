import { mdiAlert, mdiChevronDown, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { grey } from '@mui/material/colors';
// import { cyan } from '@mui/material/colors';
import { Box } from '@mui/system';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { useQuery } from 'hooks/useQuery';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface AnimalListProps {
  isLoading?: boolean;
  critterData?: IDetailedCritterWithInternalId[];
  selectedSection: IAnimalSections;
  onSelectSection: (section: IAnimalSections) => void;
  onAddButton: () => void;
}

const AnimalList = (props: AnimalListProps) => {
  const { selectedSection, onSelectSection, critterData, onAddButton } = props;
  const { cid: survey_critter_id } = useQuery();

  const history = useHistory();
  const { errors } = useFormikContext();

  const sortedCritterData = useMemo(() => {
    return [...(critterData ?? [])].sort(
      (a, b) => new Date(a.create_timestamp).getTime() - new Date(b.create_timestamp).getTime()
    );
  }, [critterData]);

  const handleCritterSelect = (id: string) => {
    if (id === survey_critter_id) {
      history.replace(history.location.pathname);
    } else {
      history.push(`?cid=${id}`);
    }
    onSelectSection(SurveyAnimalsI18N.animalGeneralTitle);
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
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={onAddButton}>
          Add
        </Button>
      </Toolbar>

      <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            p: 1,
            background: grey[100]
          }}>
          {sortedCritterData.map((critter) => (
            <Accordion
              key={critter.critter_id}
              expanded={critter.survey_critter_id.toString() === survey_critter_id}
              sx={{
                boxShadow: 'none'
              }}>
              <Box display="flex" overflow="hidden" alignItems="center" pr={1.5} className="sampleSiteHeader">
                <AccordionSummary
                  expandIcon={<Icon path={mdiChevronDown} size={1} />}
                  onClick={() => handleCritterSelect(critter.survey_critter_id.toString())}
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
                  <Box>
                    <Typography fontWeight="bold" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {critter.animal_id}
                    </Typography>
                    <Typography variant='subtitle2' color="textSecondary">{critter.taxon} • {critter.sex}</Typography>
                  </Box>
                </AccordionSummary>
              </Box>
              <AccordionDetails
                sx={{
                  pt: 0,
                  px: 0,
                  pb: 1
                }}>
                <List
                  disablePadding
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem'
                    }
                  }}>
                  {(Object.keys(ANIMAL_SECTIONS_FORM_MAP) as IAnimalSections[]).map((section) => (
                    <ListItem
                      key={section}
                      divider
                      button
                      selected={section === selectedSection}
                      onClick={() => {
                        onSelectSection(section);
                      }}>
                      <ListItemIcon>
                        <Icon path={ANIMAL_SECTIONS_FORM_MAP[section].mdiIcon} size={1} />
                      </ListItemIcon>
                      <ListItemText>{section}</ListItemText>
                      {Object.keys(errors).find((key) => key.toLowerCase() === section.toLowerCase()) !== undefined && (
                        <Tooltip
                          placement="top"
                          arrow
                          title={'There are errors in this section that must be resolved before submitting the form.'}>
                          <Icon size={1} color="#D8292F" path={mdiAlert}></Icon>
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AnimalList;
