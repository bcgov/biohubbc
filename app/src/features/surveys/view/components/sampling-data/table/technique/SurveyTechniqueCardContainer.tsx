import Stack from '@mui/material/Stack';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { useEffect } from 'react';
import { SurveyTechniqueCard } from './components/SurveyTechniqueCard';

export interface ISurveyTechniquesCardContainerProps {
  techniques: IGetTechniqueResponse[];
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  rowCount: number;
}

export const SurveyTechniquesCardContainer = (props: ISurveyTechniquesCardContainerProps) => {
  const { techniques } = props;

  const biohubApi = useBiohubApi();
  // Get method attributes for relevant method lookup ids
  const methodAttributeDataLoader = useDataLoader(() =>
    biohubApi.reference.getTechniqueAttributes(techniques.map((technique) => technique.method_lookup_id))
  );

  useEffect(() => {
    methodAttributeDataLoader.load();
  }, [methodAttributeDataLoader]);

  return (
    <Stack gap={1} direction="column" p={2}>
      {techniques.map((technique) => {
        const attributes = methodAttributeDataLoader.data?.find(
          (method) => method.method_lookup_id === technique.method_lookup_id
        );

        if (attributes) {
          return (
            <SurveyTechniqueCard
              key={technique.method_technique_id}
              methodAttributes={{
                quantitative: attributes.quantitative_attributes,
                qualitative: attributes.qualitative_attributes
              }}
              technique={technique}
            />
          );
        }
      })}
    </Stack>
  );
};
