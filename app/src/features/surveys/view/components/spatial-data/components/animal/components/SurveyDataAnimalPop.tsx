import { useCritterbaseApi } from "hooks/useCritterbaseApi";

interface ISurveyDataAnimalPopupProps {}

export const SurveyDataAnimalPopup = () => {
    const critterbaseApi = useCritterbaseApi()
    
  const mortalityDataLoader = useDataLoader((mortalityId) => critterbaseApi.mortality.getMortality(mortalityId));
  const captureDataLoader = useDataLoader((captureId) => critterbaseApi.capture.getCapture(captureId));
  return <></>;
};
