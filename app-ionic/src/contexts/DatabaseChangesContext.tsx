import React, { useContext, useEffect, useState } from 'react';
import { DatabaseContext } from './DatabaseContext';

export type IDatabaseChanges = PouchDB.Core.ChangesResponseChange<any> | PouchDB.Core.ChangesResponse<any> | any;

export const DatabaseChangesContext = React.createContext<IDatabaseChanges>(null);

/**
 * Provides access to a database changes object, which contains information about the most recent database updates.
 *
 * @param {*} props
 * @return {*}
 */
export const DatabaseChangesContextProvider: React.FC = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [databaseChanges, setDatabaseChanges] = useState<IDatabaseChanges>(null);
  const [changesListener, setChangesListener] = useState<PouchDB.Core.Changes<any>>(null);

  const setupDatabase = async () => {
    if (!changesListener || changesListener['isCancelled']) {
      const listener = databaseContext.database
        .changes({ live: true, since: 'now' })
        .on('change', (change) => {
          setDatabaseChanges(change);
        })
        .on('complete', (final) => () => setDatabaseChanges(final))
        .on('error', (error) => () => setDatabaseChanges(error));

      setChangesListener(listener);
    }
  };

  const cleanupDatabase = () => {
    if (changesListener) {
      changesListener.cancel();
    }
  };

  // TODO Update [] dependencies to properly run cleanup (if keycloak expires?)
  useEffect(() => {
    setupDatabase();

    return () => {
      cleanupDatabase();
    };
  }, [databaseContext]);

  return <DatabaseChangesContext.Provider value={databaseChanges}>{props.children}</DatabaseChangesContext.Provider>;
};
