import { Collapse } from '@mui/material';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import moment from 'moment';
import React, { useContext, useEffect, useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface AnimalSectionDataCardsProps {
  section: IAnimalSections;
  onEditClick: (idx: number) => void;
  isAddingNew: boolean;
}
export const AnimalSectionDataCards = ({ section, onEditClick, isAddingNew }: AnimalSectionDataCardsProps) => {
  const { values } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);
  const formatDate = (dt: Date) => moment(dt).format('MMM Do[,] YYYY');
  const cbApi = useCritterbaseApi();
  const { data: allFamilies, refresh: refreshFamilies } = useDataLoader(() => cbApi.family.getAllFamilies());

  useEffect(() => {
    refreshFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.family.length]);

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

  const sectionCardData = useMemo(() => {
    const sectionData: Record<
      IAnimalSections,
      Array<{ header: string; key: string; subHeaderData: Record<string, string | number | undefined> }>
    > = {
      [SurveyAnimalsI18N.animalGeneralTitle]: [
        {
          header: `General: ${values.general.animal_id}`,
          subHeaderData: { Taxon: values.general.taxon_name, Sex: values.general.sex, 'WLH ID': values.general.wlh_id },
          key: 'GENERAL_SECTION'
        }
      ],
      // Decided to loop through critter or formik values
      [SurveyAnimalsI18N.animalMarkingTitle]: values.markings.map((marking) => ({
        header: `Marking: ${marking.marking_type}`,
        subHeaderData: { Location: marking.body_location, Colour: marking.primary_colour },
        key: marking._id
      })),
      [SurveyAnimalsI18N.animalMeasurementTitle]: values.measurements.map((measurement) => ({
        header: `Measurement: ${formatDate(measurement.measured_timestamp)}`,
        subHeaderData: { [`${measurement.measurement_name}`]: measurement.option_label ?? measurement.value },
        key: measurement._id
      })),
      [SurveyAnimalsI18N.animalCaptureTitle]: values.captures.map((capture) => ({
        header: `Animal Captured: ${formatDate(capture.capture_timestamp)}`,
        subHeaderData: { Latitude: capture.capture_latitude, Longitude: capture.capture_longitude },
        key: capture._id
      })),
      [SurveyAnimalsI18N.animalMortalityTitle]: values.mortality.map((mortality) => ({
        header: `Animal Mortality: ${formatDate(mortality.mortality_timestamp)}`,
        subHeaderData: { Latitude: mortality.mortality_latitude, Longitude: mortality.mortality_longitude },
        key: mortality._id
      })),
      [SurveyAnimalsI18N.animalFamilyTitle]: values.family.map((family) => {
        const family_label = allFamilies?.find((a) => a.family_id === family.family_id)?.family_label;
        return {
          header: `Animal Relationship: ${family_label ?? family.family_id}`,
          subHeaderData: { Status: family.relationship },
          key: family._id
        };
      }),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: values.collectionUnits.map((collectionUnit) => ({
        header: `Ecological Unit: ${collectionUnit.unit_name}`,
        subHeaderData: {},
        key: collectionUnit._id
      })),
      Telemetry: values.device.map((device) => ({
        header: `Device: ${device.device_id}`,
        subHeaderData: {
          Make: device.device_make,
          Model: device.device_model,
          Deployments: device.deployments?.length ?? 0
        },
        key: `${device.device_id}`
      }))
    };
    return sectionData[section];
  }, [
    values.general.animal_id,
    values.general.taxon_name,
    values.general.sex,
    values.general.wlh_id,
    values.markings,
    values.measurements,
    values.captures,
    values.mortality,
    values.family,
    values.collectionUnits,
    values.device,
    section,
    allFamilies
  ]);

  return (
    <TransitionGroup>
      {sectionCardData.map((cardData, index) =>
        isAddingNew && index === sectionCardData.length - 1 ? null : (
          <Collapse>
            <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
              {({ remove }: FieldArrayRenderProps) => {
                const handleDelete = () => {
                  showDeleteDialog(() => {
                    // code to fire delete request
                    console.log('deleted');
                    remove(index);
                  });
                };
                return (
                  <EditDeleteStubCard
                    header={cardData.header}
                    subHeaderData={cardData.subHeaderData}
                    onClickEdit={() => onEditClick(index)}
                    onClickDelete={
                      section === SurveyAnimalsI18N.animalGeneralTitle || section === 'Telemetry'
                        ? undefined
                        : handleDelete
                    }
                  />
                );
              }}
            </FieldArray>
          </Collapse>
        )
      )}
    </TransitionGroup>
  );
};
