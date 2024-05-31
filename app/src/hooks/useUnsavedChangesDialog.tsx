import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { CancelDialogI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import * as History from 'history';
import { useContext } from 'react';
import { useHistory } from 'react-router';

/**
 * Additional object that can be passed to history.push to bypass confirmation dialog when used with `<Prompt/>`
 * @example history.push('location', SKIP_CONFIRMATION_DIALOG)
 */
export const SKIP_CONFIRMATION_DIALOG = { skipConfirmationDialog: true };

type SkipDialog = { skipConfirmationDialog?: boolean };

/**
 * Hook to handle pages that need confirmation before leaving with unsaved changes.
 * Will render a confirmation dialog when attempting to navigate to a different page.
 * In most cases this hook will be used in conjunction with the Prompt (react-router-dom) component.
 *
 * @returns {*} {
 *  renderUnsavedChangesDialog: (pathname: string) => void - manually trigger the confirmation dialog - usually used with `cancel` callbacks
 *  locationChangeInterceptor: (location: History.Location) => boolean - location change interceptor - passed to prompt `message` prop
 * }
 */
export const useUnsavedChangesDialog = () => {
  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  /**
   * Generates the cancel dialog props
   *
   * @param {string} pathname - Path to redirect to on confirmation
   * @returns {IYesNoDialogProps} Cancel dialog props
   */
  const getCancelDialogProps = (pathname: string): IYesNoDialogProps => {
    return {
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
        /**
         * History.push allows an additional unknown param to be passed
         * Allowing explicit control over when the `locationChangeInterceptor`
         * skips rendering the confirmation dialog.
         */
        history.push(pathname, SKIP_CONFIRMATION_DIALOG);
      }
    };
  };

  /**
   * Renders unsaved changes confirmation dialog - which redirects to a specific location on confirmation
   * Useful for when you need to render the confirmation dialog explicitly.
   * ie: Cancel callback or some action button
   *
   * @param {string} pathname - A history location pathname ie: 'projects'
   */
  const renderUnsavedChangesDialog = (pathname: string) => dialogContext.setYesNoDialog(getCancelDialogProps(pathname));

  /**
   * Intercepts all history navigation attempts usually used with '<Prompt>'
   *
   * Note: history.push('location', SKIP_CONFIRMATION_DIALOG) will bypass confirmation dialog.
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const locationChangeInterceptor = (location: History.Location) => {
    /**
     * onYesSkipConfirmationDialog: when onYes is selected from confirmation dialog or history.push that includes skipConfirmationDialog
     */
    const onYesSkipConfirmationDialog = (location.state as SkipDialog)?.skipConfirmationDialog;
    if (onYesSkipConfirmationDialog) {
      // Allow the location change
      return true;
    }

    // Dialog will trigger a another location change if yes selected
    dialogContext.setYesNoDialog(getCancelDialogProps(location.pathname));

    // Don't allow the location change
    return false;
  };

  return { locationChangeInterceptor, renderUnsavedChangesDialog };
};
