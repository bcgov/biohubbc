import { mdiFilterOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import MultiAutocompleteStack from '../list/components/MultiAutocompleteStack';

interface ISearchFiltersProps<T> {
  onChange: (filterValues: T) => void;
  fields: {
    id: number;
    name: string;
    component: JSX.Element;
    props?: any;
    label?: string;
  }[];
  advancedFiltersComponent?: React.ElementType;
  showAdvancedFiltersRoles?: SYSTEM_ROLE[];
}

const SearchFilters = <T extends object>(props: ISearchFiltersProps<T>) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { fields, advancedFiltersComponent: AdvancedFiltersComponent, showAdvancedFiltersRoles = [] } = props;

  const { values } = useFormikContext<T>();

  // Call onChange whenever any formik value changes
  useEffect(() => {
    props.onChange(values);
  }, [values]);

  return (
    <Stack spacing={1}>
      <Box display="flex" alignItems="center">
        <MultiAutocompleteStack>
          {fields.map((field) => (
            <Box key={field.id} minWidth="33%">
              {field.component}
            </Box>
          ))}
        </MultiAutocompleteStack>
        {AdvancedFiltersComponent && (
          <SystemRoleGuard validSystemRoles={showAdvancedFiltersRoles}>
            <IconButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} sx={{ ml: 1 }}>
              <Icon path={mdiFilterOutline} color={showAdvancedFilters ? blueGrey[500] : grey[500]} size={1.25} />
            </IconButton>
          </SystemRoleGuard>
        )}
      </Box>
      {AdvancedFiltersComponent && (
        <SystemRoleGuard validSystemRoles={showAdvancedFiltersRoles}>
          <Collapse in={showAdvancedFilters}>
            <AdvancedFiltersComponent />
          </Collapse>
        </SystemRoleGuard>
      )}
    </Stack>
  );
};

export default SearchFilters;
