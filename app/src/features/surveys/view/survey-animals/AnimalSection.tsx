import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { SurveyAnimalsI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AnimalRelationship, ANIMAL_FORM_MODE, ANIMAL_SECTION } from './animal';
import { AnimalSectionWrapper } from './AnimalSectionWrapper';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
import { FamilyAnimalForm } from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { MarkingAnimalForm } from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';
import GeneralAnimalSummary from './GeneralAnimalSummary';

dayjs.extend(utc);

type SubHeaderData = Record<string, string | number | null | undefined>;
type DeleteFn = (...args: any[]) => Promise<unknown>;

interface IAnimalSectionProps {
  /**
   * Detailed Critter from Critterbase.
   * In most cases the Critter will be defined with the exception of adding new.
   */
  critter?: ICritterDetailedResponse;
  /**
   * Callback to refresh the detailed Critter.
   * Children with the transition component are dependent on the Critter updating to trigger the transitions.
   */
  refreshCritter: (critter_id: string) => Promise<ICritterDetailedResponse | undefined>;
  /**
   * The selected section.
   * Example: 'Captures' | 'Markings'.
   */
  section: ANIMAL_SECTION;
}

/**
 * This component acts as a switch for the animal form sections.
 *
 * Goal was to make the form sections share common props and also make it flexible
 * handling the different requirements / needs of the individual sections.
 *
 * @param {IAnimalSectionProps} props
 * @returns {*}
 */
export const AnimalSection = (props: IAnimalSectionProps) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [formMode, setFormMode] = useState<ANIMAL_FORM_MODE | undefined>(undefined);
  const [formObject, setFormObject] = useState<any | undefined>(undefined);

  const formatDate = (dt: Date) => dayjs(dt).utc().format('MMMM D, YYYY');

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

  const handleDelete = async <T extends DeleteFn>(name: string, deleteService: T, ...args: Parameters<T>) => {
    const closeConfirmDialog = () => dialog.setYesNoDialog({ open: false });

    dialog.setYesNoDialog({
      dialogTitle: `Delete ${name[0].toUpperCase() + name.slice(1)}`,
      dialogText: 'Are you sure you want to delete this record?',
      open: true,
      onYes: async () => {
        closeConfirmDialog();
        try {
          await deleteService(...args);
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

  const AddButton = ({ label }: { label: string }) => (
    <Button
      startIcon={<Icon path={mdiPlus} size={1} />}
      variant="contained"
      color="primary"
      onClick={handleOpenAddForm}>
      {label}
    </Button>
  );

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

  if (props.section === ANIMAL_SECTION.GENERAL) {
    return (
      <AnimalSectionWrapper
        form={<GeneralAnimalForm {...SECTION_FORM_PROPS} formMode={ANIMAL_FORM_MODE.EDIT} />}
        infoText={SurveyAnimalsI18N.animalGeneralHelp}
        section={props.section}
        critter={props.critter}>
        <GeneralAnimalSummary critter={props.critter} handleEdit={() => handleOpenEditForm(props.critter)} />
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.COLLECTION_UNITS) {
    return (
      <AnimalSectionWrapper
        form={<CollectionUnitAnimalForm {...SECTION_FORM_PROPS} />}
        addBtn={<AddButton label={SurveyAnimalsI18N.animalCollectionUnitAddBtn} />}
        infoText={SurveyAnimalsI18N.animalCollectionUnitHelp}
        section={props.section}
        critter={props.critter}>
        <TransitionGroup>
          {props.critter.collection_units.map((unit) => (
            <Collapse key={unit.critter_collection_unit_id}>
              <EditDeleteStubCard
                header={unit.unit_name}
                subHeader={formatSubHeader({ Category: unit.category_name })}
                onClickEdit={() => handleOpenEditForm(unit)}
                onClickDelete={async () => {
                  handleDelete(
                    'ecological unit',
                    cbApi.collectionUnit.deleteCollectionUnit,
                    unit.critter_collection_unit_id
                  );
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.MARKINGS) {
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
                  handleDelete('marking', cbApi.marking.deleteMarking, marking.marking_id);
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.MEASUREMENTS) {
    return (
      <AnimalSectionWrapper
        form={<MeasurementAnimalForm {...SECTION_FORM_PROPS} />}
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
                  handleDelete(
                    'measurement',
                    cbApi.measurement.deleteQuantitativeMeasurement,
                    measurement.measurement_quantitative_id
                  );
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
                  handleDelete(
                    'measurement',
                    cbApi.measurement.deleteQualitativeMeasurement,
                    measurement.measurement_qualitative_id
                  );
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.MORTALITY) {
    return (
      <AnimalSectionWrapper
        form={<MortalityAnimalForm {...SECTION_FORM_PROPS} />}
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
                  Latitude: mortality.location.latitude,
                  Longitude: mortality.location.longitude
                })}
                onClickEdit={() => handleOpenEditForm(mortality)}
                onClickDelete={async () => {
                  handleDelete('mortality', cbApi.mortality.deleteMortality, mortality.mortality_id);
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.FAMILY) {
    return (
      <AnimalSectionWrapper
        form={<FamilyAnimalForm {...SECTION_FORM_PROPS} />}
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
                  handleDelete('parent relationship', cbApi.family.deleteRelationship, {
                    relationship: AnimalRelationship.PARENT,
                    familyID: parent.family_id,
                    critterID: props.critter?.critter_id ?? ''
                  });
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
                  handleDelete('child relationship', cbApi.family.deleteRelationship, {
                    relationship: AnimalRelationship.CHILD,
                    familyID: child.family_id,
                    critterID: props.critter?.critter_id ?? ''
                  });
                }}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      </AnimalSectionWrapper>
    );
  }

  if (props.section === ANIMAL_SECTION.CAPTURES) {
    return (
      <AnimalSectionWrapper
        form={<CaptureAnimalForm {...SECTION_FORM_PROPS} />}
        addBtn={<AddButton label={SurveyAnimalsI18N.animalCaptureAddBtn} />}
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
                  handleDelete('capture', cbApi.capture.deleteCapture, capture.capture_id);
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
