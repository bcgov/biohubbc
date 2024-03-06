import { mdiChevronDown, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { useQuery } from 'hooks/useQuery';
import { IDetailedCritterWithInternalId, ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface IAnimalListProps {
  isLoading?: boolean;
  surveyCritters?: ISimpleCritterWithInternalId[];
  selectedSection: IAnimalSections;
  onSelectSection: (section: IAnimalSections) => void;
  onSelectCritter: (critter: IDetailedCritterWithInternalId) => void;
  onAddButton: () => void;
}

const ListPlaceholder = (props: { displaySkeleton: boolean }) =>
  props.displaySkeleton ? (
    <Stack
      flexDirection="column"
      justifyContent="center"
      px={2}
      py={1.2}
      height={70}
      sx={{
        background: '#fff',
        borderBottom: '1px solid ' + grey[300],
        '& *': {
          fontSize: '0.875rem'
        }
      }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="50%" />
    </Stack>
  ) : (
    <Stack
      display="flex"
      alignItems="center"
      justifyContent="center"
      flex="1 1 auto"
      position="absolute"
      top={0}
      right={0}
      left={0}
      bottom={0}
      height="100%"
      sx={{
        background: grey[50]
      }}>
      <Typography variant="body2">No Animals</Typography>
    </Stack>
  );

const AnimalList = (props: IAnimalListProps) => {
  const { isLoading, selectedSection, onSelectSection, onSelectCritter, surveyCritters, onAddButton } = props;
  const cbApi = useCritterbaseApi();
  const { cid: survey_critter_id } = useQuery();

  const history = useHistory();

  const sortedCritterData = useMemo(() => {
    return [...(surveyCritters ?? [])]
      .sort
      //TODO NICK (a, b) => new Date(a.create_timestamp).getTime() - new Date(b.create_timestamp).getTime()
      ();
  }, [surveyCritters]);

  const handleCritterSelect = async (critter: ISimpleCritterWithInternalId) => {
    if (critter.survey_critter_id === survey_critter_id) {
      history.replace(history.location.pathname);
    } else {
      history.push(`?cid=${critter.survey_critter_id}`);
    }
    const detailedCritter = await cbApi.critters.getDetailedCritter(critter.critter_id);
    onSelectCritter(detailedCritter);
    onSelectSection(SurveyAnimalsI18N.animalGeneralTitle);
  };

  return (
    <Paper component={Stack} flexDirection="column" height="100%" overflow="hidden">
      <Toolbar
        disableGutters
        sx={{
          flex: '0 0 auto',
          pr: 3,
          pl: 2
        }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Animals
        </Typography>
        <Button
          variant="contained"
          sx={{
            mr: -1
          }}
          color="primary"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={onAddButton}>
          Add
        </Button>
      </Toolbar>
      <Divider flexItem></Divider>
      <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          left="0"
          sx={{
            background: grey[100]
          }}>
          {!sortedCritterData.length ? (
            <ListPlaceholder displaySkeleton={!!isLoading && !sortedCritterData?.length} />
          ) : (
            sortedCritterData.map((critter) => (
              <Accordion
                disableGutters
                square
                sx={{
                  boxShadow: 'none',
                  borderBottom: '1px solid' + grey[300],
                  '&:before': {
                    display: 'none'
                  }
                }}
                key={critter.critter_id}
                expanded={critter.survey_critter_id.toString() === survey_critter_id}>
                <Box display="flex" overflow="hidden" alignItems="center" className="sampleSiteHeader">
                  <AccordionSummary
                    expandIcon={<Icon path={mdiChevronDown} size={1} />}
                    onClick={() => handleCritterSelect(critter)}
                    aria-controls="panel1bh-content"
                    sx={{
                      flex: '1 1 auto',
                      gap: '16px',
                      height: '70px',
                      px: 2,
                      overflow: 'hidden',
                      '& .MuiAccordionSummary-content': {
                        flex: '1 1 auto',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }
                    }}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {critter.animal_id}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {critter.itis_scientific_name} | {critter.sex}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                </Box>
                <AccordionDetails
                  sx={{
                    p: 0
                  }}>
                  <List
                    disablePadding
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem'
                      }
                    }}>
                    {(Object.keys(ANIMAL_SECTIONS_FORM_MAP) as IAnimalSections[]).map((section) => (
                      <ListItemButton
                        sx={{
                          px: 2,
                          borderTop: '1px solid' + grey[300],
                          '&:last-of-type': {
                            border: 'none'
                          }
                        }}
                        key={section}
                        selected={section === selectedSection}
                        onClick={() => {
                          onSelectSection(section);
                        }}>
                        <ListItemIcon>
                          <Icon path={ANIMAL_SECTIONS_FORM_MAP[section].mdiIcon} size={1} />
                        </ListItemIcon>
                        <ListItemText>{section}</ListItemText>
                      </ListItemButton>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default AnimalList;
