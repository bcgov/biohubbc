import { DocType } from 'constants/database';
import { IDatabaseContext } from 'contexts/DatabaseContext';
import { v4 as uuidv4 } from 'uuid';

export const notifyError = async (databaseContext: IDatabaseContext, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: DocType.NOTIFICATION,
    notificationType: 'error',
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
};

export const notifySuccess = async (databaseContext: IDatabaseContext, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: DocType.NOTIFICATION,
    notificationType: 'success',
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
};

export const notifyWarning = async (databaseContext: IDatabaseContext, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: DocType.NOTIFICATION,
    notificationType: 'warning',
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
};
