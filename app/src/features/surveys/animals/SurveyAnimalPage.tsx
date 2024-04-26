import { CircularProgress } from '@mui/material';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import { AnimalPageContextProvider } from 'contexts/animalPageContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import SurveyAnimalList from './list/SurveyAnimalList';
import AnimalProfileContainer from './profile/AnimalProfileContainer';
import SurveyAnimalHeader from './SurveyAnimalHeader';

/**
 * Returns the page for managing marked or known animals
 *
 * @returns
 */
const SurveyAnimalPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();

  const crittersDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
  );

  if (!crittersDataLoader.data) {
    crittersDataLoader.load();
  }

  if (!projectContext.projectDataLoader.data) {
    projectContext.projectDataLoader.load(surveyContext.projectId);
  }

  if (!projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }
  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      overflow="hidden"
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveyAnimalHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <AnimalPageContextProvider>
        <Stack
          direction="row"
          gap={1}
          height='100%'
          sx={{
            flex: '1 1 auto',
            p: 1
          }}>
          <Box width="400px" height="100%">
            <DialogContextProvider>
              <SurveyAnimalList />
            </DialogContextProvider>
          </Box>

          <Box flex="1 1 auto" height='100%'>
            <AnimalProfileContainer />
          </Box>

          {/* Observations Table
          <Box flex="1 1 auto">
            <DialogContextProvider>
              <TaxonomyContextProvider>
                <ObservationsTableContextProvider>
                  <ObservationsTableContext.Consumer>
                    {(context) => {
                      if (!context?._muiDataGridApiRef.current) {
                        // Delay rendering the ObservationsTable until the DataGrid API is available
                        return <CircularProgress className="pageProgress" size={40} />;
                      }

                      return <ObservationsTableContainer />;
                    }}
                  </ObservationsTableContext.Consumer>
                </ObservationsTableContextProvider>
              </TaxonomyContextProvider>
            </DialogContextProvider>
          </Box> */}
        </Stack>
      </AnimalPageContextProvider>
    </Stack>
  );
};

export default SurveyAnimalPage;

// import { SurveyContext } from 'contexts/surveyContext';
// import { SurveySectionFullPageLayout } from 'features/surveys/components/SurveySectionFullPageLayout';
// import { useBiohubApi } from 'hooks/useBioHubApi';
// import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
// import useDataLoader from 'hooks/useDataLoader';
// import { useQuery } from 'hooks/useQuery';
// import { useContext, useEffect, useState } from 'react';
// import { ANIMAL_FORM_MODE, ANIMAL_SECTION } from './animal';
// import AnimalList from './AnimalList';
// import { AnimalSection } from './AnimalSection';
// import GeneralAnimalForm from './form-sections/GeneralAnimalForm';

// export const SurveyAnimalsPage = () => {
//   const bhApi = useBiohubApi();
//   const cbApi = useCritterbaseApi();
//   const { surveyId, projectId } = useContext(SurveyContext);
//   const { cid } = useQuery();

//   const survey_critter_id = Number(cid);

//   const [selectedSection, setSelectedSection] = useState<ANIMAL_SECTION>(ANIMAL_SECTION.GENERAL);
//   const [openAddCritter, setOpenAddCritter] = useState(false);

//   const {
//     data: surveyCritters,
//     load: loadCritters,
//     refresh: refreshSurveyCritters,
//     isLoading: crittersLoading
//   } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));

//   const { data: detailedCritter, refresh: refreshCritter } = useDataLoader(cbApi.critters.getDetailedCritter);

//   loadCritters();

//   useEffect(() => {
//     const getDetailedCritterOnMount = async () => {
//       if (detailedCritter) {
//         return;
//       }
//       const focusCritter = surveyCritters?.find((critter) => critter.survey_critter_id === Number(survey_critter_id));
//       if (!focusCritter) {
//         return;
//       }
//       await refreshCritter(focusCritter.critter_id);
//     };
//     getDetailedCritterOnMount();
//   }, [surveyCritters, survey_critter_id, cbApi.critters, detailedCritter, refreshCritter]);

//   return (
//     <>
//       <GeneralAnimalForm
//         formMode={ANIMAL_FORM_MODE.ADD}
//         open={openAddCritter}
//         surveyId={surveyId}
//         projectId={projectId}
//         handleClose={() => {
//           setOpenAddCritter(false);
//           refreshSurveyCritters();
//         }}
//       />
//       <SurveySectionFullPageLayout
//         pageTitle="Manage Animals"
//         sideBarComponent={
//           <AnimalList
//             onAddButton={() => setOpenAddCritter(true)}
//             refreshCritter={refreshCritter}
//             surveyCritters={surveyCritters}
//             isLoading={crittersLoading}
//             selectedSection={selectedSection}
//             onSelectSection={(section) => setSelectedSection(section)}
//           />
//         }
//         mainComponent={
//           <AnimalSection
//             key={selectedSection}
//             critter={detailedCritter}
//             section={selectedSection}
//             refreshCritter={refreshCritter}
//           />
//         }
//       />
//     </>
//   );
// };
