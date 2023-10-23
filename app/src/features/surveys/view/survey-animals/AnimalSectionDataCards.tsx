import { Collapse } from '@mui/material';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { EditDeleteStubCard } from 'features/surveys/components/EditDeleteStubCard';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface AnimalSectionDataCardsProps {
  section: IAnimalSections;
  critter: IDetailedCritterWithInternalId;
  onEditClick: (idx: number) => void;
}
export const AnimalSectionDataCards = ({ section, critter, onEditClick }: AnimalSectionDataCardsProps) => {
  const { values } = useFormikContext<IAnimal>();
  const formatDate = (dt: Date) => moment(dt).format('MMM Do[,] YYYY');

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
      [SurveyAnimalsI18N.animalMarkingTitle]: critter.marking.map((marking) => ({
        header: `Marking: ${marking.marking_type ?? ''}`,
        subHeaderData: { a: 'test' },
        key: marking.marking_id
      })),
      [SurveyAnimalsI18N.animalMeasurementTitle]: values.measurements.map((measurement) => ({
        header: measurement.measured_timestamp
          ? `Measurement: ${formatDate(measurement.measured_timestamp)}`
          : 'Measurement',
        subHeaderData: {},
        key: measurement._id
      })),
      [SurveyAnimalsI18N.animalCaptureTitle]: values.captures.map((capture) => ({
        header: capture.capture_timestamp
          ? `Animal Captured: ${formatDate(capture.capture_timestamp)}`
          : 'Animal Captured',
        subHeaderData: { Latitude: capture.capture_latitude, Longitude: capture.capture_longitude },
        key: capture._id
      })),
      [SurveyAnimalsI18N.animalMortalityTitle]: values.mortality.map((mortality) => ({
        header: mortality.mortality_timestamp
          ? `Animal Mortality: ${formatDate(mortality.mortality_timestamp)}`
          : `Animal Mortality`,
        subHeaderData: { Latitude: mortality.mortality_latitude, Longitude: mortality.mortality_longitude },
        key: mortality._id
      })),
      [SurveyAnimalsI18N.animalFamilyTitle]: values.family.map((family) => ({
        header: `Animal Relationship: ${family.relationship ?? ''}`,
        subHeaderData: {},
        key: family._id
      })),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: values.collectionUnits.map((collectionUnit) => ({
        header: `Ecological Unit: ${
          critter.collection_units.find(
            (critter_collection_unit) => critter_collection_unit.critter_collection_unit_id === collectionUnit._id
          )?.unit_name ?? ''
        }`,
        subHeaderData: {},
        key: 'TEMP'
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
    section,
    values.collectionUnits,
    values.captures,
    values.mortality,
    values.measurements,
    values.family,
    values.device,
    critter.marking,
    critter.collection_units
  ]);

  return (
    <TransitionGroup>
      {sectionCardData.map((cardData, index) => (
        <Collapse key={cardData.key}>
          <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
            {({ remove }: FieldArrayRenderProps) => (
              <EditDeleteStubCard
                header={cardData.header}
                subHeaderData={cardData.subHeaderData}
                onClickEdit={() => onEditClick(index)}
                onClickDelete={
                  section === SurveyAnimalsI18N.animalGeneralTitle || section === 'Telemetry'
                    ? undefined
                    : () => remove(index)
                }
              />
            )}
          </FieldArray>
        </Collapse>
      ))}
    </TransitionGroup>
  );
};
