import { mdiAlert, mdiChevronDown, mdiPlus } from '@mdi/js';
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
  Tooltip,
  Typography
} from '@mui/material';
import { cyan } from '@mui/material/colors';
import { Box } from '@mui/system';
import { DialogContext } from 'contexts/dialogContext';
import { useFormikContext } from 'formik';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual } from 'lodash-es';
import React, { useContext, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ANIMAL_SUBSECTIONS, IAnimalSubSections, MANAGE_ANIMALS_DEFAULT_URL_PARAM } from './animal';

interface AnimalListProps {
  isLoading?: boolean;
  critterData?: IDetailedCritterWithInternalId[];
  selectedSection: IAnimalSubSections;
  onSelectSection: (section: IAnimalSubSections) => void;
  onAddButton: () => void;
}

const AnimalList = ({ selectedSection, onSelectSection, critterData, isLoading, onAddButton }: AnimalListProps) => {
  const { survey_critter_id } = useParams<{ survey_critter_id?: string }>();
  const history = useHistory();
  const { errors, values, initialValues } = useFormikContext();
  const dialogContext = useContext(DialogContext);

  const sortedCritterData = useMemo(() => {
    return [...(critterData ?? [])].sort(
      (a, b) => new Date(a.create_timestamp).getTime() - new Date(b.create_timestamp).getTime()
    );
  }, [critterData]);

  const showCreateYesNoDialog = (surveyCritterID: string) => {
    dialogContext.setYesNoDialog({
      dialogTitle: `Unsaved Changes`,
      dialogText: 'Current animal has unsaved changes. Are you sure you want to discard these changes?',
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        dialogContext.setYesNoDialog({ open: false });
        history.push(surveyCritterID);
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true
    });
  };

  const handleCritterSelect = (id: string) => {
    const formHasChanges = !isEqual(values, initialValues);
    let critterParamID = id;
    if (survey_critter_id === id) {
      critterParamID = MANAGE_ANIMALS_DEFAULT_URL_PARAM;
    }
    onSelectSection('General');
    formHasChanges ? showCreateYesNoDialog(critterParamID) : history.push(critterParamID);
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

      {isLoading ? (
        // Skeleton Load
        <div>LOADING</div>
      ) : critterData ? (
        // Animal List
        sortedCritterData?.map((critter) => (
          <Accordion
            disableGutters
            key={critter.critter_id}
            expanded={critter.survey_critter_id.toString() == survey_critter_id}
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
                <Typography fontWeight="bold" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    key={section}
                    dense
                    divider
                    button
                    selected={section === selectedSection}
                    onClick={() => {
                      onSelectSection(section);
                    }}>
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
