import { mdiFilterOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { blueGrey } from '@mui/material/colors';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import ProjectAdvancedFilters, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState } from 'react';

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  handleReset: () => void;
}

const ProjectsListFilterForm: React.FC<IProjectsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <>
      <Box p={3}>
        <Formik innerRef={formikRef} initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
          <Stack spacing={1}>
            <Box display="flex" alignItems="center">
              <Stack
                direction="row"
                gap={0}
                sx={{
                  border: `1px solid ${grey[300]}`,
                  borderRadius: '5px',
                  '& fieldset': { border: 'none' },
                  '& .Mui-focused': { outline: 'none', border: 'red', boxShadow: '0 !important' },
                  '& .MuiInputLabel-root': { background: '#fff', px: 1.5 }
                }}
                flex="1 1 auto">
                <CustomTextField name="keyword" label="Search by keyword" other={{ sx: { px: 1, flex: '1 1 auto' } }} />
                <Divider orientation="vertical" flexItem sx={{ my: 1.5, bgcolor: grey[200] }} />
                <CustomTextField
                  name="species"
                  label="Search by species"
                  other={{ sx: { px: 1, flex: '0.5 1 auto' } }}
                />
                <Divider orientation="vertical" flexItem sx={{ my: 1.5, bgcolor: grey[200] }} />
                <CustomTextField
                  name="project_member"
                  label="Search by person"
                  other={{ sx: { px: 1, flex: '0.5 1 auto' } }}
                />
              </Stack>
              <IconButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} sx={{ ml: 1 }}>
                <Icon path={mdiFilterOutline} color={showAdvancedFilters ? blueGrey[500] : grey[500]} size={1.25} />
              </IconButton>
            </Box>
            <Collapse in={showAdvancedFilters}>
              <ProjectAdvancedFilters />
            </Collapse>
            {/* <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => formikRef.current?.handleSubmit()}>
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  props.handleReset();
                  formikRef.current?.resetForm();
                }}>
                Clear
              </Button>
            </Stack> */}
            <Typography variant="body2" color="textSecondary">
              {formikRef?.current?.values ? 'Showing all Projects' : 'Showing results for'}
            </Typography>
          </Stack>
        </Formik>
      </Box>
    </>
  );
};

export default ProjectsListFilterForm;
