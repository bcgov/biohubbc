import { CancelDialogI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import * as History from 'history';
import { useContext, useRef } from 'react';
import { useHistory } from 'react-router';

/**
 * Hook to handle pages that need confirmation before leaving with unsaved changes.
 * Will render a confirmation dialog when attempting to navigate to a different page.
 * In most cases this hook will be used in conjunction with the Prompt (react-router-dom) component.
 *
 * @returns {*} {
 *  locationChangeInterceptor: (location: History.Location) => boolean - location change interceptor - passed to prompt `message` prop
 * }
 */
export const useUnsavedChangesDialog = () => {
  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  const skipUnsavedChangesDialogRef = useRef(false);

  /**
   * Skip the unsaved changes dialog
   *
   * @returns {*} {void}
   */
  const skipUnsavedChangesDialog = (): void => {
    skipUnsavedChangesDialogRef.current = true;
  };

  /**
   * Intercepts all history navigation attempts usually used with '<Prompt>'
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const locationChangeInterceptor = (location: History.Location) => {
    if (skipUnsavedChangesDialogRef.current) {
      skipUnsavedChangesDialogRef.current = false;
      return true;
    }

    // Dialog will trigger a another location change if yes selected
    dialogContext.setYesNoDialog({
      dialogTitle: CancelDialogI18N.cancelTitle,
      dialogText: CancelDialogI18N.cancelText,
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        dialogContext.setYesNoDialog({ open: false });

        // Set the ref to true so the next location change is allowed
        skipUnsavedChangesDialogRef.current = true;
        history.push(location.pathname);
      }
    });

    // Don't allow the location change
    return false;
  };

  return { locationChangeInterceptor, skipUnsavedChangesDialog };
};
