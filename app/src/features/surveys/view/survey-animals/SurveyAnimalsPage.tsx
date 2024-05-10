import { SurveyContext } from 'contexts/surveyContext';
import { SurveySectionFullPageLayout } from 'features/surveys/components/layout/SurveySectionFullPageLayout';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { useContext, useEffect, useState } from 'react';
import { ANIMAL_FORM_MODE, ANIMAL_SECTION } from './animal';
import AnimalList from './AnimalList';
import { AnimalSection } from './AnimalSection';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';

export const SurveyAnimalsPage = () => {
  const bhApi = useBiohubApi();
  const cbApi = useCritterbaseApi();
  const { surveyId, projectId } = useContext(SurveyContext);
  const { cid } = useQuery();

  const survey_critter_id = Number(cid);

  const [selectedSection, setSelectedSection] = useState<ANIMAL_SECTION>(ANIMAL_SECTION.GENERAL);
  const [openAddCritter, setOpenAddCritter] = useState(false);

  const {
    data: surveyCritters,
    load: loadCritters,
    refresh: refreshSurveyCritters,
    isLoading: crittersLoading
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));

  const { data: detailedCritter, refresh: refreshCritter } = useDataLoader(cbApi.critters.getDetailedCritter);

  loadCritters();

  useEffect(() => {
    const getDetailedCritterOnMount = async () => {
      if (detailedCritter) {
        return;
      }
      const focusCritter = surveyCritters?.find((critter) => critter.survey_critter_id === Number(survey_critter_id));
      if (!focusCritter) {
        return;
      }
      await refreshCritter(focusCritter.critter_id);
    };
    getDetailedCritterOnMount();
  }, [surveyCritters, survey_critter_id, cbApi.critters, detailedCritter, refreshCritter]);

  return (
    <>
      <GeneralAnimalForm
        formMode={ANIMAL_FORM_MODE.ADD}
        open={openAddCritter}
        surveyId={surveyId}
        projectId={projectId}
        handleClose={() => {
          setOpenAddCritter(false);
          refreshSurveyCritters();
        }}
      />
      <SurveySectionFullPageLayout
        pageTitle="Manage Animals"
        sideBarComponent={
          <AnimalList
            onAddButton={() => setOpenAddCritter(true)}
            refreshCritter={refreshCritter}
            surveyCritters={surveyCritters}
            isLoading={crittersLoading}
            selectedSection={selectedSection}
            onSelectSection={(section) => setSelectedSection(section)}
          />
        }
        mainComponent={
          <AnimalSection
            key={selectedSection}
            critter={detailedCritter}
            section={selectedSection}
            refreshCritter={refreshCritter}
          />
        }
      />
    </>
  );
};
