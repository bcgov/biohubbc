import { DATE_FORMAT } from 'constants/dateFormats';
import { IConfig } from 'contexts/configContext';
import moment from 'moment';

/**
 * Checks if a url string starts with an `http(s)://` protocol, and adds `https://` if it does not.
 *
 * @param {string} url
 * @param {('http://' | 'https://')} [protocol='https://'] The protocol to add, if necessary. Defaults to `https://`.
 * @return {*}  {string} the url which is guaranteed to have an `http(s)://` protocol.
 */
export const ensureProtocol = (url: string, protocol: 'http://' | 'https://' = 'https://'): string => {
  return ((url.startsWith('http://') || url.startsWith('https://')) && url) || `${protocol}${url}`;
};

/**
 * Formats a date range into a formatted string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {string} startDate ISO 8601 date string
 * @param {string} [endDate] ISO 8601 date string
 * @param {string} [dateSeparator='-'] specify date range separator
 * @return {string} formatted date string, or an empty string if unable to parse the startDate and/or endDate
 */
export const getFormattedDateRangeString = (
  dateFormat: DATE_FORMAT,
  startDate: string,
  endDate?: string,
  dateSeparator: string = '-'
): string => {
  const startDateFormatted = getFormattedDate(dateFormat, startDate);

  const endDateFormatted = getFormattedDate(dateFormat, endDate || '');

  if (!startDateFormatted || (endDate && !endDateFormatted)) {
    return '';
  }

  if (endDateFormatted) {
    return `${startDateFormatted} ${dateSeparator} ${endDateFormatted}`;
  }

  return startDateFormatted;
};

/**
 * Get a formatted date string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {string} date ISO 8601 date string
 * @return {string} formatted date string, or an empty string if unable to parse the date
 */
export const getFormattedDate = (dateFormat: DATE_FORMAT, date: string): string => {
  const dateMoment = moment(date);

  if (!dateMoment.isValid()) {
    //date was invalid
    return '';
  }

  return dateMoment.format(dateFormat);
};

/**
 * Get a formatted amount string.
 *
 * @param {number} amount
 * @return {string} formatted amount string (rounded to the nearest integer), or an empty string if unable to parse the amount
 */
export const getFormattedAmount = (amount: number): string => {
  if (!amount && amount !== 0) {
    //amount was invalid
    return '';
  }

  return (
    '$ ' +
    Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
};

/**
 * Log the user out, redirecting them to the logout page.
 *
 * @param {IConfig} config
 */
export const logOut = (config: IConfig) => {
  if (!config || !config.KEYCLOAK_CONFIG?.url || !config.KEYCLOAK_CONFIG?.realm || !config.SITEMINDER_LOGOUT_URL) {
    return;
  }

  const localRedirectURL = `${window.location.origin}/login`;

  const keycloakLogoutRedirectURL = `${config.KEYCLOAK_CONFIG.url}/realms/${config.KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout?redirect_uri=${localRedirectURL}`;

  const siteminderLogoutURL = `${config.SITEMINDER_LOGOUT_URL}?returl=${keycloakLogoutRedirectURL}&retnow=1`;

  window.location.replace(siteminderLogoutURL);
};
