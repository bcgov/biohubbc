import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import EnvironmentStandardCard from 'features/standards/view/components/EnvironmentStandardCard';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { EnvironmentsSearch } from './search/EnvironmentsSearch';

export interface IConfigureEnvironmentColumnsProps {
  environmentColumns: EnvironmentType;
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType) => void;
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
}

export const ConfigureEnvironmentColumns = (props: IConfigureEnvironmentColumnsProps) => {
  const { environmentColumns, onAddEnvironmentColumns, onRemoveEnvironmentColumns } = props;

  const hasEnvironmentColumns =
    environmentColumns.qualitative_environments.length || environmentColumns.quantitative_environments.length;

  return (
    <>
      <Typography variant="h5" mb={2}>
        Configure Environment Columns
      </Typography>
      <EnvironmentsSearch
        selectedEnvironments={environmentColumns}
        onAddEnvironmentColumn={(environmentColumn) => onAddEnvironmentColumns(environmentColumn)}
      />
      <Box mt={3}>
        {hasEnvironmentColumns ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 500 }} color="textSecondary" mb={2}>
              Selected environments
            </Typography>
            <Stack gap={2} sx={{ overflowY: 'auto' }} maxHeight={400}>
              {environmentColumns.qualitative_environments.map((environment) => (
                <Box
                  display="flex"
                  alignItems="flex-start"
                  key={`qualitative_environment_item_${environment.environment_qualitative_id}`}>
                  <EnvironmentStandardCard
                    small
                    label={environment.name}
                    description={environment.description ?? ''}
                    options={environment.options}
                  />
                  <Box ml={1} mt={1}>
                    <IconButton
                      aria-label="Remove environment column"
                      onClick={() =>
                        onRemoveEnvironmentColumns({
                          qualitative_environments: [environment.environment_qualitative_id],
                          quantitative_environments: []
                        })
                      }
                      data-testid="configure-environment-qualitative-column-remove-button">
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {environmentColumns.quantitative_environments.map((environment) => (
                <Box
                  display="flex"
                  alignItems="flex-start"
                  key={`quantitative_environment_item_${environment.environment_quantitative_id}`}>
                  <EnvironmentStandardCard small label={environment.name} description={environment.description ?? ''} />
                  <Box ml={1} mt={1}>
                    <IconButton
                      aria-label="Remove environment column"
                      onClick={() =>
                        onRemoveEnvironmentColumns({
                          qualitative_environments: [],
                          quantitative_environments: [environment.environment_quantitative_id]
                        })
                      }
                      data-testid="configure-environment-quantitative-column-remove-button">
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