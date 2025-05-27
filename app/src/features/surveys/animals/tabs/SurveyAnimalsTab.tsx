import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { AnimalListContainer } from '../list/AnimalListContainer';
import { AnimalProfileContainer } from '../profile/AnimalProfileContainer';

// // Supported URL parameters
// // Note: Prefix 'a_' is used to avoid conflicts with similar query params from other components
// type AnimalDataTableURLParams = {
//   // filter
//   a_itis_tsn?: string;
//   // pagination
//   a_page?: string;
//   a_limit?: string;
//   a_sort?: string;
//   a_order?: 'asc' | 'desc';
// };

// // Default pagination parameters
// const initialPaginationParams: ApiPaginationRequestOptions = {
//   page: 0,
//   limit: 10,
//   sort: undefined,
//   order: undefined
// };

/**
 * Returns the page for managing Animals
 *
 * @return {*}
 */
export const SurveyAnimalsTab = () => {
  //   const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const { selectedAnimal } = useAnimalPageContext();

  //   const { searchParams, setSearchParams } = useSearchParams<StringValues<AnimalDataTableURLParams>>();

  //   const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
  //     pageSize: Number(searchParams.get('a_limit') ?? initialPaginationParams.limit),
  //     page: Number(searchParams.get('a_page') ?? initialPaginationParams.page)
  //   });

  //   const [sortModel, setSortModel] = useState<GridSortModel>([
  //     {
  //       field: searchParams.get('a_sort') ?? initialPaginationParams.sort ?? '',
  //       sort: (searchParams.get('a_order') ?? initialPaginationParams.order) as GridSortDirection
  //     }
  //   ]);

  //   const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAnimalsAdvancedFilters>({
  //     itis_tsn: searchParams.get('a_itis_tsn')
  //       ? Number(searchParams.get('a_itis_tsn'))
  //       : AnimalsAdvancedFiltersInitialValues.itis_tsn
  //   });

  //   const sort = firstOrNull(sortModel);
  //   const paginationSort: ApiPaginationRequestOptions = {
  //     limit: paginationModel.pageSize,
  //     sort: sort?.field || undefined,
  //     order: sort?.sort || undefined,
  //     page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  //   };

  //   const animalsDataLoader = useDataLoader(
  //     (pagination?: ApiPaginationRequestOptions, filter?: IAnimalsAdvancedFilters) =>
  //       biohubApi.animal.findAnimals(pagination, filter)
  //   );

  //   useDeepCompareEffect(() => {
  //     animalsDataLoader.refresh(paginationSort, advancedFiltersModel);
  //   }, [advancedFiltersModel, paginationSort]);

  //   const rows = animalsDataLoader.data?.animals ?? [];
  //   const pagination = animalsDataLoader.data?.pagination;

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack height="100%" boxSizing="border-box">
      {selectedAnimal ? (
        <SidebarLayout
          elevation={0}
          sx={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
          sidebar={
            <Box p={2} minWidth="500px" flex="1 1 auto">
              <AnimalListContainer />
            </Box>
          }>
          <AnimalProfileContainer />
        </SidebarLayout>
      ) : (
        <Box py={2} minWidth="400px" flex="1 1 auto" height="100%">
          <AnimalListContainer />
        </Box>
      )}
    </Stack>
  );
};
