import { mdiArrowTopRight, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { blueGrey, grey } from '@mui/material/colors';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { EnvironmentsSearch } from './search/EnvironmentsSearch';

export interface IConfigureEnvironmentColumnsProps {
  /**
   * The environment columns.
   *
   * @type {EnvironmentType}
   * @memberof IConfigureEnvironmentColumnsProps
   */
  environmentColumns: EnvironmentType;
  /**
   * Callback fired on adding environment columns.
   *
   * @memberof IConfigureEnvironmentColumnsProps
   */
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType) => void;
  /**
   * Callback fired on removing environment columns.
   *
   * @memberof IConfigureEnvironmentColumnsProps
   */
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
}

/**
 * Renders a component to configure the environment columns of the observations table.
 *
 * @param {IConfigureEnvironmentColumnsProps} props
 * @return {*}
 */
export const ConfigureEnvironmentColumns = (props: IConfigureEnvironmentColumnsProps) => {
  const { environmentColumns, onAddEnvironmentColumns, onRemoveEnvironmentColumns } = props;

  const hasEnvironmentColumns =
    environmentColumns.qualitative_environments.length || environmentColumns.quantitative_environments.length;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="h5" mb={2}>
        Add Environmental Variables
      </Typography>
      <EnvironmentsSearch
        selectedEnvironments={environmentColumns}
        onAddEnvironmentColumn={(environmentColumn) => onAddEnvironmentColumns(environmentColumn)}
      />
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
                <AccordionStandardCard
                  label={environment.name}
                  subtitle={environment.description}
                  colour={grey[100]}
                  children={
                    <Stack gap={1} my={2}>
                      {environment.options.map((option) => (
                        <AccordionStandardCard
                          key={option.environment_qualitative_option_id}
                          label={option.name}
                          subtitle={option.description}
                          colour={grey[200]}
                          disableCollapse
                        />
                      ))}
                    </Stack>
                  }
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
                <AccordionStandardCard
                  label={environment.name}
                  subtitle={environment.description}
                  colour={grey[100]}
                  ornament={
                    environment.unit ? <ColouredRectangleChip colour={blueGrey} label={environment.unit} /> : undefined
                  }
                />
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
        <NoDataOverlay
          minHeight="200px"
          title="Add Environmental Variables"
          subtitle="Select variables to include in your observations data. There are currently none selected."
          icon={mdiArrowTopRight}
        />
      )}
    </Box>
  );
};
