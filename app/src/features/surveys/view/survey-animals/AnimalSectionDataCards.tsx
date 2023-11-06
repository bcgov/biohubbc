import Collapse from '@mui/material/Collapse';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IFamily } from 'hooks/cb_api/useFamilyApi';
import moment from 'moment';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { setMessageSnackbar } from 'utils/Utils';
import { IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

export type SubHeaderData = Record<string, string | number | null | undefined>;

interface AnimalSectionDataCardsProps {
  /*
   * section selected from the vertical nav bar ie: 'General'
   */
  section: IAnimalSections;

  /*
   * handler for the card edit action, needs index of the selected card
   */
  onEditClick: (idx: number) => void;

  /*
   * providing additional family information for rendering the family cards with english readable values
   */
  allFamilies?: IFamily[];
}

/**
 * Renders animal data as cards for the selected section
 *
 * @param {AnimalSectionDataCardsProps} props
 *
 * @return {*}
 *
 **/

export const AnimalSectionDataCards = (props: AnimalSectionDataCardsProps) => {
  const { section, onEditClick, allFamilies } = props;

  const { submitForm, initialValues, isSubmitting, status } = useFormikContext<IAnimal>();
  const [canDisplaySnackbar, setCanDisplaySnackbar] = useState(false);
  const statusRef = useRef<string | undefined>();

  const dialogContext = useContext(DialogContext);
  const formatDate = (dt: Date) => moment(dt).format('MMM Do[,] YYYY');

  useEffect(() => {
    // This delays the snackbar from entering until the card has finished animating
    // Stores the custom status returned from formik before its deleted
    // Manually setting when canDisplaySnackbar occurs ie: editing does not have animation
    if (statusRef.current && canDisplaySnackbar) {
      setTimeout(() => {
        statusRef.current && setMessageSnackbar(statusRef.current, dialogContext);
        statusRef.current = undefined;
        setCanDisplaySnackbar(false);
      }, 1000);
    }
    if (status) {
      statusRef.current = status;
    }
  }, [canDisplaySnackbar, status, dialogContext]);

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
        subHeader: `Date of Measurement: ${formatDate(measurement.measured_timestamp)}`,
        key: measurement.measurement_qualitative_id ?? measurement.measurement_quantitative_id ?? 'new-measurement-key'
      })),
      [SurveyAnimalsI18N.animalCaptureTitle]: initialValues.captures.map((capture) => ({
        header: `${formatDate(capture.capture_timestamp)}`,
        subHeader: formatSubHeader({ Latitude: capture.capture_latitude, Longitude: capture.capture_longitude }),
        key: capture.capture_id ?? 'new-capture-key'
      })),
      [SurveyAnimalsI18N.animalMortalityTitle]: initialValues.mortality.map((mortality) => ({
        header: `${formatDate(mortality.mortality_timestamp)}`,
        subHeader: formatSubHeader({
          Latitude: mortality.mortality_latitude,
          Longitude: mortality.mortality_longitude
        }),
        key: mortality.mortality_id ?? 'new-mortality-key'
      })),
      [SurveyAnimalsI18N.animalFamilyTitle]: initialValues.family.map((family) => {
        const family_label = allFamilies?.find((a) => a.family_id === family.family_id)?.family_label;
        return {
          header: `${family_label}`,
          subHeader: formatSubHeader({ Relationship: family.relationship }),
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
      isLoading: isSubmitting,
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
                  <Collapse
                    key={cardData.key}
                    addEndListener={() => {
                      setCanDisplaySnackbar(true);
                    }}>
                    <EditDeleteStubCard
                      header={cardData.header}
                      subHeader={cardData.subHeader}
                      onClickEdit={() => {
                        setCanDisplaySnackbar(true);
                        onEditClick(index);
                      }}
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
