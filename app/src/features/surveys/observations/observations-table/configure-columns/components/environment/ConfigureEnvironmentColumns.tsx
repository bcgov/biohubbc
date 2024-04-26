import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import EnvironmentStandardCard from 'features/standards/view/components/EnvironmentStandardCard';
import { EnvironmentType } from 'interfaces/useReferenceApi.interface';
import { EnvironmentsSearch } from './search/EnvironmentsSearch';

export interface IConfigureEnvironmentColumnsProps {
  environmentColumns: EnvironmentType[];
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType[]) => void;
  onRemoveEnvironmentColumns: (fields: string[]) => void;
}

export const ConfigureEnvironmentColumns = (props: IConfigureEnvironmentColumnsProps) => {
  const { environmentColumns, onAddEnvironmentColumns, onRemoveEnvironmentColumns } = props;

  return (
    <>
      <Typography variant="h5" mb={2}>
        Configure Environment Columns
      </Typography>
      <EnvironmentsSearch
        selectedEnvironments={environmentColumns}
        onAddEnvironmentColumn={(environmentColumn) => onAddEnvironmentColumns([environmentColumn])}
      />
      <Box mt={3}>
        {environmentColumns.length ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 500 }} color="textSecondary" mb={2}>
              Selected environments
            </Typography>
            <Stack gap={2} sx={{ overflowY: 'auto' }} maxHeight={400}>
              {environmentColumns.map((environment) => (
                <Box display="flex" alignItems="flex-start">
                  <EnvironmentStandardCard
                    small
                    label={environment.name}
                    description={environment.description ?? ''}
                    options={'options' in environment ? environment['options'] : []}
                  />
                  <Box ml={1} mt={1}>
                    <IconButton
                      aria-label="Remove environment column"
                      onClick={() => onRemoveEnvironmentColumns([String(environment.environment_id)])}
                      data-testid="configure-environment-column-remove-button">
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <Box mt={5} height={100} display="flex" justifyContent="center" alignItems="center">
            <Typography color="textSecondary">No environments selected</Typography>
          </Box>
        )}
      </Box>
    </>
  );
};
