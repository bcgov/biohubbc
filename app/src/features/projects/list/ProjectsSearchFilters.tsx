import { mdiFilterOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';
import ProjectAdvancedFilters, { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { SYSTEM_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import SystemUserAutocomplete from '../components/SystemUserAutocomplete';
import MultiAutocompleteStack from './components/MultiAutocompleteStack';

interface IProjectsSearchFiltersProps {
  onChange: (filterValues: IProjectAdvancedFilters) => void;
}

const ProjectsSearchFilters = (props: IProjectsSearchFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // const biohubApi = useBiohubApi();

  const codesContext = useCodesContext();

  const { values, setFieldValue } = useFormikContext<IProjectAdvancedFilters>();

  // Request projects whenever any formik value changes
  useEffect(() => {
    props.onChange(values);
  }, [values]);

  if (!codesContext.codesDataLoader.data) {
    return <></>;
  }

  console.log(values);

  return (
    <Stack spacing={1}>
      <Box display="flex" alignItems="center">
        <MultiAutocompleteStack>
          <CustomTextField placeholder="Type any keyword" name="keyword" label="Keyword" other={{ sx: { pl: 1 } }} />
          <Box minWidth="33%">
            <SpeciesAutocompleteField
              formikFieldName={'itis_tsns'}
              label={'Species'}
              required={false}
              handleSpecies={(value) => {
                setFieldValue('itis_tsns', value?.tsn);
              }}
              handleClear={() => {
                setFieldValue('itis_tsns', '');
              }}
              clearOnSelect={true}
              showSelectedValue={true}
            />
          </Box>
          <Box minWidth="33%">
            <SystemUserAutocomplete
              label="Person"
              formikFieldName="system_user_id"
              handleUser={(value) => {
                setFieldValue('system_user_id', value?.system_user_id);
              }}
              handleClear={() => {
                setFieldValue('system_user_id', '');
              }}
              required={false}
              showSelectedValue={true}
            />
          </Box>
        </MultiAutocompleteStack>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <IconButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} sx={{ ml: 1 }}>
            <Icon path={mdiFilterOutline} color={showAdvancedFilters ? blueGrey[500] : grey[500]} size={1.25} />
          </IconButton>
        </SystemRoleGuard>
      </Box>
      <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
        <Collapse in={showAdvancedFilters}>
          <ProjectAdvancedFilters />
        </Collapse>
      </SystemRoleGuard>
    </Stack>
  );
};

export default ProjectsSearchFilters;
