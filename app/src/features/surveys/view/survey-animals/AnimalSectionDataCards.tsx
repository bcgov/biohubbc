import Collapse from '@mui/material/Collapse';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IFamily } from 'hooks/cb_api/useFamilyApi';
import moment from 'moment';
import { useContext, useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
// import Paper from '@mui/material/Paper';

export type SubHeaderData = Record<string, string | number | undefined>;

interface AnimalSectionDataCardsProps {
  section: IAnimalSections;
  onEditClick: (idx: number) => void;
  allFamilies?: IFamily[];
}
export const AnimalSectionDataCards = ({ section, onEditClick, allFamilies }: AnimalSectionDataCardsProps) => {
  const { submitForm, initialValues } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);
  const formatDate = (dt: Date) => moment(dt).format('MMM Do[,] YYYY');

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

  const sectionCardData = useMemo(() => {
    const sectionData: Record<IAnimalSections, Array<{ header: string; key: string; subHeader: string }>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: [
        {
          header: `General: ${initialValues.general.animal_id}`,
          subHeader: formatSubHeader({
            Taxon: initialValues.general.taxon_name,
            Sex: initialValues.general.sex,
            'WLH ID': initialValues.general.wlh_id
          }),
          key: 'general-key'
        }
      ],
      [SurveyAnimalsI18N.animalMarkingTitle]: initialValues.markings.map((marking) => ({
        header: `${marking.marking_type}`,
        subHeader: formatSubHeader({ Location: marking.body_location, Colour: marking.primary_colour }),
        key: marking.marking_id ?? 'new-marking-key'
      })),
      [SurveyAnimalsI18N.animalMeasurementTitle]: initialValues.measurements.map((measurement) => ({
        header: `${measurement.measurement_name}: ${measurement.option_label ?? measurement.value}`,
        subHeader: `Date: ${formatDate(measurement.measured_timestamp)}`,
        key: measurement.measurement_qualitative_id ?? measurement.measurement_quantitative_id ?? 'new-measurement-key'
      })),
      [SurveyAnimalsI18N.animalCaptureTitle]: initialValues.captures.map((capture) => ({
        header: `Animal Captured: ${formatDate(capture.capture_timestamp)}`,
        subHeader: formatSubHeader({ Latitude: capture.capture_latitude, Longitude: capture.capture_longitude }),
        key: capture.capture_id ?? 'new-capture-key'
      })),
      [SurveyAnimalsI18N.animalMortalityTitle]: initialValues.mortality.map((mortality) => ({
        header: `Animal Mortality: ${formatDate(mortality.mortality_timestamp)}`,
        subHeader: formatSubHeader({
          Latitude: mortality.mortality_latitude,
          Longitude: mortality.mortality_longitude
        }),
        key: mortality.mortality_id ?? 'new-mortality-key'
      })),
      [SurveyAnimalsI18N.animalFamilyTitle]: initialValues.family.map((family) => {
        const family_label = allFamilies?.find((a) => a.family_id === family.family_id)?.family_label;
        return {
          header: family_label ? `Animal Relationship: ${family_label}` : `Animal Relationship`,
          subHeader: formatSubHeader({ Status: family.relationship }),
          key: family.family_id ?? 'new-family-key'
        };
      }),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: initialValues.collectionUnits.map((collectionUnit) => ({
        header: `${collectionUnit.unit_name}`,
        subHeader: formatSubHeader({ Category: collectionUnit.category_name }),
        key: collectionUnit.critter_collection_unit_id ?? 'new-collection-unit-key'
      })),
      Telemetry: initialValues.device.map((device) => ({
        header: `Device: ${device.device_id}`,
        subHeader: formatSubHeader({
          Make: device.device_make,
          Model: device.device_model,
          Deployments: device.deployments?.length ?? 0
        }),
        key: `${device.device_id}`
      }))
    };
    return sectionData[section];
  }, [
    initialValues.general.animal_id,
    initialValues.general.taxon_name,
    initialValues.general.sex,
    initialValues.markings,
    initialValues.measurements,
    initialValues.captures,
    initialValues.mortality,
    initialValues.family,
    initialValues.collectionUnits,
    initialValues.device,
    initialValues.general.wlh_id,
    section,
    allFamilies
  ]);

  const showDeleteDialog = (onConfirmDelete: () => void) => {
    const close = () => dialogContext.setYesNoDialog({ open: false });
    dialogContext.setYesNoDialog({
      dialogTitle: `Delete ${ANIMAL_SECTIONS_FORM_MAP[section].dialogTitle}`,
      dialogText: 'Are you sure you want to delete this record?',
      open: true,
      onYes: async () => {
        onConfirmDelete();
        close();
      },
      onNo: () => close(),
      onClose: () => close()
    });
  };

  return (
    <>
      <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
        {({ remove }: FieldArrayRenderProps) => {
          return (
            <TransitionGroup>
              {sectionCardData.map((cardData, index) => {
                const submitFormRemoveCard = () => {
                  remove(index);
                  submitForm();
                };
                const handleDelete = () => {
                  showDeleteDialog(submitFormRemoveCard);
                };
                return (
                  <Collapse key={cardData.key} timeout={0}>
                    <EditDeleteStubCard
                      header={cardData.header}
                      subHeader={cardData.subHeader}
                      onClickEdit={() => onEditClick(index)}
                      onClickDelete={
                        section === SurveyAnimalsI18N.animalGeneralTitle || section === 'Telemetry'
                          ? undefined
                          : handleDelete
                      }
                    />
                  </Collapse>
                );
              })}
            </TransitionGroup>
          );
        }}
      </FieldArray>

      {/* Empty State */}
      {/* {sectionCardData.length === 0 ? (
        <Paper variant="outlined">
          <Typography component="strong" color="textSecondary" fontWeight={700}>
            No records found
          </Typography>
        </Paper>
      ) : null} */}
    </>
  );
};
