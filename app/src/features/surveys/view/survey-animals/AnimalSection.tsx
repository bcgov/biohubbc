import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { SurveyAnimalsI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ANIMAL_FORM_MODE } from './animal';
import { IAnimalSections } from './animal-sections';
import { AnimalSectionWrapper } from './AnimalSectionWrapper';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { MarkingAnimalForm } from './form-sections/MarkingAnimalForm';
import GeneralAnimalSummary from './GeneralAnimalSummary';

type SubHeaderData = Record<string, string | number | null | undefined>;

interface IAnimalSectionProps {
  critter?: ICritterDetailedResponse;
  refreshCritter: (critter_id: string) => Promise<ICritterDetailedResponse | undefined>;
  section: IAnimalSections;
}
export const AnimalSection = (props: IAnimalSectionProps) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [formMode, setFormMode] = useState<ANIMAL_FORM_MODE | undefined>(undefined);
  const [formObject, setFormObject] = useState<any | undefined>(undefined);

  const formatDate = (dt: Date) => dayjs(dt).format('MMMM D, YYYY h:mm A');

  const handleOpenAddForm = () => {
    setFormObject(undefined);
    setFormMode(ANIMAL_FORM_MODE.ADD);
  };

  const handleOpenEditForm = (editObject: any) => {
    setFormObject(editObject);
    setFormMode(ANIMAL_FORM_MODE.EDIT);
  };

  const refreshDetailedCritter = async () => {
    if (props.critter) {
      return props.refreshCritter(props.critter.critter_id);
    }
  };

  const handleCloseForm = () => {
    setFormObject(undefined);
    setFormMode(undefined);
    refreshDetailedCritter();
  };

  const handleDelete = async (deleteService: (id: string) => Promise<unknown>, id: string, name: string) => {
    const closeConfirmDialog = () => dialog.setYesNoDialog({ open: false });

    dialog.setYesNoDialog({
      dialogTitle: `Delete ${name[0].toUpperCase() + name.slice(1)}`,
      dialogText: 'Are you sure you want to delete this record?',
      open: true,
      onYes: async () => {
        closeConfirmDialog();
        try {
          await deleteService(id);
          await refreshDetailedCritter();
          dialog.setSnackbar({ open: true, snackbarMessage: `Successfully deleted ${name}` });
        } catch (err) {
          dialog.setSnackbar({ open: true, snackbarMessage: `Failed to delete ${name}` });
        }
      },
      onNo: () => closeConfirmDialog(),
      onClose: () => closeConfirmDialog()
    });
  };

  const formatSubHeader = (subHeaderData: SubHeaderData) => {
    const formatArr: string[] = [];
    const entries = Object.entries(subHeaderData);
    entries.forEach(([key, value]) => {
      if (value == null || value === '') {
        return;
      }
      formatArr.push(`${key}: ${value}`);
    });
    return formatArr.join(' | ');
  };

  if (!props.critter) {
    return (
      <AnimalSectionWrapper>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex="1 1 auto"
          p={3}
          sx={{
            overflowY: 'auto',
            background: grey[100]
          }}>
          <Typography component="span" variant="body2">
            No Animal Selected
          </Typography>
        </Box>
      </AnimalSectionWrapper>
    );
  }

  const SECTION_FORM_PROPS = {
    formMode: formMode ? formMode : ANIMAL_FORM_MODE.ADD,
    formObject: formObject,
    critter: props.critter,
    open: !!formMode,
    handleClose: handleCloseForm
  } as const;

  const AddButton = ({ label }: { label: string }) => (
    <Button
      startIcon={<Icon path={mdiPlus} size={1} />}
      variant="contained"
      color="primary"
      onClick={handleOpenAddForm}>
      {label}
    </Button>
  );

  if (props.section === 'General') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        infoText={SurveyAnimalsI18N.animalGeneralHelp}
        section={props.section}
        critter={props.critter}>
        <GeneralAnimalSummary critter={props.critter} handleEdit={() => handleOpenEditForm(props.critter)} />
      </AnimalSectionWrapper>
    );
  }

  if (props.section === 'Ecological Units') {
    return (
      <AnimalSectionWrapper
        form={<GeneralAnimalForm />}
        infoText={SurveyAnimalsI18N.animalCollectionUnitHelp}
        section={props.section}
        critter={props.critter}
      />
    );
  }

  if (props.section === 'Markings') {
    return (
      <AnimalSectionWrapper
        form={<MarkingAnimalForm {...SECTION_FORM_PROPS} />}
        addBtn={<AddButton label={SurveyAnimalsI18N.animalMarkingAddBtn} />}
        infoText={SurveyAnimalsI18N.animalMarkingHelp}
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.markings.map((marking) => (
            <Collapse key={marking.marking_id}>
              <EditDeleteStubCard
                header={'Marking'}
                subHeader={formatSubHeader({ Location: marking.body_location, Colour: marking.primary_colour })}
                onClickEdit={() => handleOpenEditForm(marking)}
                onClickDelete={async () => {
                  handleDelete(cbApi.marking.deleteMarking, marking.marking_id, 'marking');
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === 'Measurements') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        infoText={SurveyAnimalsI18N.animalMeasurementHelp}
        addBtn={<AddButton label={SurveyAnimalsI18N.animalMeasurementAddBtn} />}
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.measurements.quantitative.map((measurement) => (
            <Collapse key={measurement.measurement_quantitative_id}>
              <EditDeleteStubCard
                header={`${measurement.measurement_name}: ${measurement.value}`}
                subHeader={
                  measurement.measured_timestamp
                    ? `Date of Measurement: ${formatDate(new Date(measurement.measured_timestamp))}`
                    : undefined
                }
                onClickEdit={() => handleOpenEditForm(measurement)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
          {props.critter.measurements.qualitative.map((measurement) => (
            <Collapse key={measurement.measurement_qualitative_id}>
              <EditDeleteStubCard
                header={`${measurement.measurement_name}: ${measurement.value}`}
                subHeader={
                  measurement.measured_timestamp
                    ? `Date of Measurement: ${formatDate(new Date(measurement.measured_timestamp))}`
                    : undefined
                }
                onClickEdit={() => handleOpenEditForm(measurement)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === 'Mortality Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        infoText={SurveyAnimalsI18N.animalMortalityHelp}
        addBtn={
          props.critter.mortality.length === 0 ? (
            <AddButton label={SurveyAnimalsI18N.animalMortalityAddBtn} />
          ) : undefined
        }
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.mortality.map((mortality) => (
            <Collapse key={mortality.mortality_id}>
              <EditDeleteStubCard
                header={formatDate(new Date(mortality.mortality_timestamp))}
                subHeader={formatSubHeader({
                  Latitude: mortality.mortality_location.latitude,
                  Longitude: mortality.mortality_location.longitude
                })}
                onClickEdit={() => handleOpenEditForm(mortality)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === 'Family') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        infoText={SurveyAnimalsI18N.animalFamilyHelp}
        addBtn={<AddButton label={SurveyAnimalsI18N.animalFamilyAddBtn} />}
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.family_parent.map((parent) => (
            <Collapse key={parent.family_id}>
              <EditDeleteStubCard
                header={parent.family_label}
                subHeader={formatSubHeader({
                  Relationship: 'Parent'
                })}
                onClickEdit={() => handleOpenEditForm(parent)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
          {props.critter.family_child.map((child) => (
            <Collapse key={child.family_id}>
              <EditDeleteStubCard
                header={child.family_label}
                subHeader={formatSubHeader({
                  Relationship: 'Child'
                })}
                onClickEdit={() => handleOpenEditForm(child)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === 'Capture Events') {
    return (
      <AnimalSectionWrapper
        form={<div>placeholder</div>}
        infoText={SurveyAnimalsI18N.animalCaptureHelp}
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.captures.map((capture) => (
            <Collapse key={capture.capture_id}>
              <EditDeleteStubCard
                header={formatDate(new Date(capture.capture_timestamp))}
                subHeader={formatSubHeader({
                  Latitude: capture.capture_location?.latitude,
                  Longitude: capture.capture_location?.longitude
                })}
                onClickEdit={() => handleOpenEditForm(capture)}
                onClickDelete={async () => {
                  // handleDelete(deleteMarking, 'marking');
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  return null;
};
