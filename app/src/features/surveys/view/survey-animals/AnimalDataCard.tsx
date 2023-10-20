import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, Collapse, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

interface AnimalDataCardProps {
  header: string;
  subHeaderData: Record<string, string | number | undefined>;
  onClickEdit: () => void;
  onClickDelete: () => void;
}
export const AnimalDataCard = ({ header, subHeaderData, onClickEdit, onClickDelete }: AnimalDataCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        background: grey[100],
        '& .MuiCardHeader-subheader': {
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          maxWidth: '92ch',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '14px'
        },
        mt: 1,
        '& .MuiCardHeader-title': {
          mb: 0.5
        }
      }}>
      <CardHeader
        action={
          <>
            <IconButton aria-label="settings" onClick={onClickEdit}>
              <Icon path={mdiPencilOutline} size={1} />
            </IconButton>
            <IconButton aria-label="settings" onClick={onClickDelete}>
              <Icon path={mdiTrashCanOutline} size={1} />
            </IconButton>
          </>
        }
        title={header}
        subheader={Object.entries(subHeaderData).map((pairs, idx) => {
          const SEPARATOR = ' / ';
          const key = pairs[0];
          const value = idx < pairs.length - 1 ? `${pairs[1]}${SEPARATOR}` : pairs[1];
          return value ? `${key} • ${value}` : ``;
        })}
      />
    </Card>
  );
};

interface AnimalSectionDataCardsProps {
  section: IAnimalSections;
  critter: IDetailedCritterWithInternalId;
}
export const AnimalSectionDataCards = ({ section, critter }: AnimalSectionDataCardsProps) => {
  const { values } = useFormikContext<IAnimal>();
  const formatDate = (dt: Date) => moment(dt).format('MMM Do[,] YYYY');

  const sectionCardData = useMemo(() => {
    const sectionData: Record<
      IAnimalSections,
      Array<{ header: string; key: string; subHeaderData: Record<string, string | number | undefined> }>
    > = {
      [SurveyAnimalsI18N.animalGeneralTitle]: [{ header: 'General', subHeaderData: {}, key: 'GENERAL_SECTION' }],
      // Decided to loop through critter or formik values
      [SurveyAnimalsI18N.animalMarkingTitle]: critter.marking.map((marking) => ({
        header: `Marking: ${marking.marking_type}`,
        subHeaderData: { a: 'test' },
        key: marking.marking_id
      })),
      [SurveyAnimalsI18N.animalMeasurementTitle]: values.measurements.map((measurement) => ({
        header: `Measurement: ${formatDate(measurement.measured_timestamp)}`,
        subHeaderData: {},
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
      [SurveyAnimalsI18N.animalFamilyTitle]: values.family.map((family) => ({
        header: `Animal Relationship: ${family.relationship}`,
        subHeaderData: {},
        key: family._id
      })),
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: values.collectionUnits.map((collectionUnit) => ({
        header: `Ecological Unit: ${
          critter.collection_units.find(
            (critter_collection_unit) => critter_collection_unit.critter_collection_unit_id === collectionUnit._id
          )?.unit_name
        }`,
        subHeaderData: {},
        key: 'TEMP'
      })),
      Telemetry: values.device.map((device) => ({
        header: `Device: ${device.device_id}`,
        subHeaderData: { Make: device.device_make, Model: device.device_model },
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
              <AnimalDataCard
                header={cardData.header}
                subHeaderData={cardData.subHeaderData}
                onClickEdit={() => console.log('EDIT')}
                onClickDelete={() => remove(index)}
              />
            )}
          </FieldArray>
        </Collapse>
      ))}
    </TransitionGroup>
  );
};
