import {
  mdiAccountDetailsOutline,
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiDotsVertical,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import green from '@mui/material/colors/green';
import red from '@mui/material/colors/red';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { CustomMenuButton, CustomMenuIconButton } from 'components/toolbar/ActionToolbars';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useHistory } from 'react-router';

const pageSizeOptions = [10, 25, 50];

interface IActiveUsersTableProps {
  /**
   * The list of active users to display in the table.
   */
  activeUsers: ISystemUser[];
  /**
   * The list of system role codes.
   */
  systemRoles: ICode[];
  /**
   * Callback fired when the remove user button is clicked.
   */
  onRemoveUserClick: (user: ISystemUser) => void;
  /**
   * Callback fired when a user is soft deleted (blocked from logging in)
   */
  onDeactivateUserClick: (user: ISystemUser) => void;
  /**
   * Callback fired when an existing, deactivated user is reactivated (record_end_end becomes null)
   */
  onActivateUserClick: (user: ISystemUser) => void;
  /**
   * Callback fired when a role is selected from the user permission control.
   */
  handleChangeUserPermissionsClick: (user: ISystemUser, newRoleName: string, newRoleId: number) => void;
  /**
   * The current pagination model for the table.
   */
  pagination: GridPaginationModel;
  /**
   * Callback fired when the pagination model is updated.
   */
  setPagination: (newPagination: GridPaginationModel) => void;
  /**
   * The current sort model for the table.
   */
  sortModel: GridSortModel;
  /**
   * Callback fired when the sort model is updated.
   */
  setSortModel: (newSortModel: GridSortModel) => void;
  /**
   * The total number of rows in the table. This will be used to determine the number of pages in the pagination
   * control.
   */
  rowCount: number;
}

/**
 * Table of active system users with controls for updating user roles and deleting users
 *
 * @param {IActiveUsersTableProps} props
 * @returns
 */
const ActiveUsersTable = (props: IActiveUsersTableProps) => {
  const history = useHistory();

  const {
    activeUsers,
    onRemoveUserClick,
    onDeactivateUserClick,
    onActivateUserClick,
    systemRoles,
    handleChangeUserPermissionsClick,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
    rowCount
  } = props;

  const sortedSystemRoles = [...systemRoles].sort((item1, item2) => item1.name.localeCompare(item2.name));

  const activeUsersColumnDefs: GridColDef<ISystemUser>[] = [
    {
      field: 'system_user_id',
      headerName: 'ID',
      width: 85,
      minWidth: 85,
      renderHeader: () => (
        <Typography color="textSecondary" variant="body2">
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color="textSecondary" variant="body2">
          {params.row.system_user_id}
        </Typography>
      )
    },
    {
      field: 'display_name',
      headerName: 'Display Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => <Typography variant="body2">{params.row.display_name}</Typography>
    },
    {
      field: 'identity_source',
      headerName: 'Account Type',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => params.row.identity_source
    },
    {
      field: 'user_identifier',
      headerName: 'Username',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => params.row.user_identifier
    },
    {
      field: 'record_end_date',
      headerName: 'Status',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => params.row.record_end_date,
      renderCell: (params) => (
        <ColouredRectangleChip
          colour={params.row.record_end_date ? red : green}
          label={params.row.record_end_date ? 'Blocked' : 'Active'}
        />
      )
    },
    {
      field: 'role_names',
      flex: 1,
      headerName: 'Role',
      disableColumnMenu: true,
      valueGetter: (params) => {
        return params.row.role_names[0];
      },
      renderCell: (params) => {
        return (
          <CustomMenuButton
            buttonLabel={params.value ?? 'Not Applicable'}
            buttonTitle={'Change User Permissions'}
            buttonProps={{ variant: 'outlined', size: 'small' }}
            menuItems={sortedSystemRoles.map((item) => {
              return {
                menuLabel: item.name,
                menuOnClick: () => handleChangeUserPermissionsClick(params.row, item.name, item.id)
              };
            })}
            buttonEndIcon={<Icon path={mdiChevronDown} size={1} />}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 70,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        // Button for activating or reactivating the user, depending on their current state
        const activationMenuItem = params.row.record_end_date
          ? {
              menuIcon: <Icon path={mdiCheck} size={1} />,
              menuLabel: 'Reactivate User',
              menuOnClick: () => onActivateUserClick(params.row)
            }
          : {
              menuIcon: <Icon path={mdiClose} size={1} />,
              menuLabel: 'Block User',
              menuOnClick: () => onDeactivateUserClick(params.row)
            };
        return (
          <CustomMenuIconButton
            buttonTitle="Actions"
            buttonIcon={<Icon path={mdiDotsVertical} size={1} />}
            menuItems={[
              {
                menuIcon: <Icon path={mdiAccountDetailsOutline} size={1} />,
                menuLabel: 'View Users Details',
                menuOnClick: () =>
                  history.push({
                    pathname: `/admin/manage/users/${params.row.system_user_id}`,
                    state: params.row
                  })
              },
              activationMenuItem,
              {
                menuIcon: <Icon path={mdiTrashCanOutline} size={1} />,
                menuLabel: 'Remove User',
                menuOnClick: () => onRemoveUserClick(params.row)
              }
            ]}
          />
        );
      }
    }
  ];

  return (
    <StyledDataGrid<ISystemUser>
      noRowsMessage="No Active Users"
      columns={activeUsersColumnDefs}
      rows={activeUsers}
      getRowId={(row) => row.system_user_id}
      paginationMode="server"
      paginationModel={pagination}
      onPaginationModelChange={setPagination}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      rowCount={rowCount}
      pageSizeOptions={pageSizeOptions}
      disableRowSelectionOnClick
      rowSelection={false}
    />
  );
};

export default ActiveUsersTable;
