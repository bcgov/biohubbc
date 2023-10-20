import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, Collapse, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
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
        // TODO Handle undefined value
        subheader={Object.entries(subHeaderData)
          .map(([key, value]) => `${key} • ${value}`)
          .join(' | ')}
      />
    </Card>
  );
};

interface AnimalSectionDataCards {
  section: IAnimalSections;
}
export const AnimalSectionDataCards = ({ section }: AnimalSectionDataCards) => {
  const { values } = useFormikContext<IAnimal>();
  const sectionDataCardMap: Record<
    IAnimalSections,
    Array<{ header: string; subHeaderData: Record<string, string | number | undefined> }>
  > = {
    [SurveyAnimalsI18N.animalGeneralTitle]: [{ header: 'General', subHeaderData: {} }],
    [SurveyAnimalsI18N.animalMarkingTitle]: values.markings.map((marking) => ({
      header: `Marking`,
      subHeaderData: { a: 'test' }
    })),
    [SurveyAnimalsI18N.animalMeasurementTitle]: [{ header: 'Measurement', subHeaderData: {} }],
    [SurveyAnimalsI18N.animalCaptureTitle]: values.captures.map((capture) => ({
      header: `Animal Captured: ${capture.capture_timestamp}`,
      subHeaderData: { Latitude: capture.capture_latitude, Longitude: capture.capture_longitude }
    })),
    [SurveyAnimalsI18N.animalMortalityTitle]: [{ header: 'Mortality', subHeaderData: {} }],
    [SurveyAnimalsI18N.animalFamilyTitle]: [{ header: 'Family', subHeaderData: {} }],
    [SurveyAnimalsI18N.animalCollectionUnitTitle]: [{ header: 'Ecological Unit', subHeaderData: {} }],
    Telemetry: [{ header: 'Device', subHeaderData: {} }]
  };

  const sectionData = sectionDataCardMap[section];
  return (
    <TransitionGroup>
      {sectionData.map((cardData, index) => (
        <Collapse>
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
