import { mdiFilterOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ProjectAdvancedFilters, { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import MultiAutocompleteStack from './components/MultiAutocompleteStack';

interface IProjectsSearchFiltersProps {
  onChange: (filterValues: IProjectAdvancedFilters) => void;
}

const ProjectsSearchFilters = (props: IProjectsSearchFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { values } = useFormikContext<IProjectAdvancedFilters>();

  const multiAutocompleteFields = [
    { label: 'Keyword', formikName: 'keyword' },
    { label: 'Species', formikName: 'species' },
    { label: 'Person', formikName: 'person' }
  ];

  // Request projects whenever any formik value changes
  useEffect(() => {
    props.onChange(values);
  }, [values]);

  return (
    <Stack spacing={1}>
      <Box display="flex" alignItems="center">
        <MultiAutocompleteStack fields={multiAutocompleteFields} />
        <IconButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} sx={{ ml: 1 }}>
          <Icon path={mdiFilterOutline} color={showAdvancedFilters ? blueGrey[500] : grey[500]} size={1.25} />
        </IconButton>
      </Box>
      <Collapse in={showAdvancedFilters}>
        <ProjectAdvancedFilters />
      </Collapse>
    </Stack>
  );
};

export default ProjectsSearchFilters;
