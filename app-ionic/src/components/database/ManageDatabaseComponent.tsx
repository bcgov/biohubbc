import { Button } from '@material-ui/core';
import { DeleteForever } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext } from 'react';

interface IManageDatabaseComponentProps {
  classes?: any;
}

const ManageDatabaseComponent: React.FC<IManageDatabaseComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const resetDatabase = async () => {
    await databaseContext.resetDatabase();
  };

  return (
    <Button variant="contained" startIcon={<DeleteForever />} onClick={() => resetDatabase()}>
      Wipe Local Data
    </Button>
  );
};

export default ManageDatabaseComponent;
