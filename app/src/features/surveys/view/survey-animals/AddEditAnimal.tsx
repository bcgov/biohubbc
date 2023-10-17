import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { Form, Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual } from 'lodash-es';
import React, { useContext, useMemo } from 'react';
import { AnimalSchema, AnimalSex, IAnimal, IAnimalSubSections } from './animal';
import { transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

interface AddEditAnimalProps {
  critter_id: string | null;
  section: IAnimalSubSections;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const surveyContext = useContext(SurveyContext);
  const bhApi = useBiohubApi();

  const { critter_id, section } = props;

  const { data: critterData, load: loadCritters } = useDataLoader(() =>
    bhApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
  );

  loadCritters();

  //temp
  const isSaving = false;

  const obtainAnimalFormInitialvalues = useMemo(() => {
    const AnimalFormValues: IAnimal = {
      general: { wlh_id: '', taxon_id: '', taxon_name: '', animal_id: '', sex: AnimalSex.UNKNOWN, critter_id: '' },
      captures: [],
      markings: [],
      mortality: [],
      collectionUnits: [],
      measurements: [],
      family: [],
      images: [],
      device: undefined
    };

    const existingCritter = critterData?.find(
      (critter: IDetailedCritterWithInternalId) => critter_id === critter.critter_id
    );
    if (!existingCritter) {
      return AnimalFormValues;
    }
    return transformCritterbaseAPIResponseToForm(existingCritter);
  }, [critterData, critter_id]);

  const renderFormContent = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSubSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <GeneralAnimalForm />,
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalForm />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: <MeasurementAnimalForm />,
      [SurveyAnimalsI18N.animalCaptureTitle]: <CaptureAnimalForm />,
      [SurveyAnimalsI18N.animalMortalityTitle]: <MortalityAnimalForm />,
      [SurveyAnimalsI18N.animalFamilyTitle]: <FamilyAnimalForm />,
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <CollectionUnitAnimalForm />
    };
    return sectionMap[section] ? sectionMap[section] : <Typography>Unimplemented</Typography>;
  }, [section]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Formik
      initialValues={obtainAnimalFormInitialvalues}
      enableReinitialize
      validationSchema={AnimalSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(values) => {}}>
      {(formik) => (
        <>
          <Toolbar
            sx={{
              flex: '0 0 auto',
              borderBottom: '1px solid #ccc',
              '& button': {
                minWidth: '6rem'
              },
              '& button + button': {
                ml: 1
              }
            }}>
            <Typography
              sx={{
                flexGrow: '1',
                fontSize: '1.125rem',
                fontWeight: 700
              }}>
              {critter_id ? `Animal Details: ${obtainAnimalFormInitialvalues.general.animal_id}` : 'Animal Details'}
            </Typography>

            <Box
              sx={{
                '& div:first-of-type': {
                  display: 'flex',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }
              }}>
              <Box display="flex" overflow="hidden">
                <Collapse in={!isEqual(formik.initialValues, formik.values)} orientation="horizontal">
                  <Box ml={1} whiteSpace="nowrap">
                    <LoadingButton
                      loading={isSaving}
                      variant="contained"
                      color="primary"
                      onClick={() => console.log(formik)}>
                      Save
                    </LoadingButton>
                    <Button variant="outlined" color="primary" onClick={() => console.log('discarding')}>
                      Discard Changes
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </Toolbar>
          <Form>{critter_id ? renderFormContent : null}</Form>
        </>
      )}
    </Formik>
  );
};
