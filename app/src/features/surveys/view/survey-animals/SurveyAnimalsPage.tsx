import { SurveyContext } from 'contexts/surveyContext';
import { SurveySectionFullPageLayout } from 'features/surveys/components/layout/SurveySectionFullPageLayout';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { useContext, useEffect, useState } from 'react';
import AnimalList from './AnimalList';
import { AnimalSection } from './AnimalSection';
import { ANIMAL_FORM_MODE, ANIMAL_SECTION } from './animal';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';

export const SurveyAnimalsPage = () => {
  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  const { surveyId, projectId } = useContext(SurveyContext);

  const query = useQuery();

  const critter_id = Number(query.critter_id);

  const [selectedSection, setSelectedSection] = useState<ANIMAL_SECTION>(ANIMAL_SECTION.GENERAL);
  const [openAddCritter, setOpenAddCritter] = useState(false);

  const {
    data: surveyCritters,
    load: loadCritters,
    refresh: refreshSurveyCritters,
    isLoading: crittersLoading
  } = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));

  const { data: detailedCritter, refresh: refreshCritter } = useDataLoader(critterbaseApi.critters.getDetailedCritter);

  loadCritters();

  useEffect(() => {
    const getDetailedCritterOnMount = async () => {
      if (detailedCritter) {
        return;
      }
      const focusCritter = surveyCritters?.find((critter) => critter.critter_id === Number(critter_id));
      if (!focusCritter) {
        return;
      }
      await refreshCritter(focusCritter.critterbase_critter_id);
    };
    getDetailedCritterOnMount();
  }, [surveyCritters, critter_id, critterbaseApi.critters, detailedCritter, refreshCritter]);

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
