import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

const CaptureMeasurementsForm = () => {
  const critterbaseApi = useCritterbaseApi();
  const { critterDataLoader } = useAnimalPageContext();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  if (!measurementsDataLoader.data) {
    const tsn = critterDataLoader.data?.itis_tsn;
    if (tsn) {
      measurementsDataLoader.load(tsn);
    }
  }

  //   const onSelectOption = (value) => {
  //     setFieldValue(`measurements`, value);
  //   };

  return (
    <>
      {/* <MeasurementsSearchAutocomplete
        selectedOptions={selectedMeasurements}
        getOptions={async (inputValue: string) => {
          const response = await measurementsDataLoader.refresh(inputValue);
          return (response && [...response.qualitative, ...response.quantitative]) || [];
        }}
        onSelectOptions={onSelectOptions}
      /> */}
    </>
  );
};

export default CaptureMeasurementsForm;
