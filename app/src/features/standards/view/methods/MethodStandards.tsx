import Box from '@mui/material/Box';
import { MethodStandardsResults } from './MethodStandardsResults';

export interface IMethodStandardResult {
  method_type_id: number;
  label: string;
  description: string;
  attributes: { attribute_id: number; label: string; description: string }[];
}

/**
 *
 * This component will handle the data request, then pass the data to its children components.
 *
 * @returns
 */
export const MethodStandards = () => {
  // TODO: Fetch information about methods, like below
  //
  // const biohubApi = useBiohubApi()
  // const methodsDataLoader = useDataLoader(() => ...)
  // useEffect(() => {methodsDataLoader.load()})
  const data: IMethodStandardResult[] = [
    {
      method_type_id: 1,
      label: 'camera trap',
      description: 'camera trap is a camera',
      attributes: [
        {
          attribute_id: 1,
          label: 'height above ground',
          description: 'The distance the camera is placed above the ground'
        }
      ]
    },
    {
      method_type_id: 2,
      label: 'dip net',
      description: 'dip net is a net',
      attributes: [
        {
          attribute_id: 2,
          label: 'mesh size',
          description: 'size of the mesh'
        }
      ]
    }
  ];

  return (
    <Box sx={{ mt: 2 }} flex="1 1 auto">
      <MethodStandardsResults data={data} />
    </Box>
  );
};
