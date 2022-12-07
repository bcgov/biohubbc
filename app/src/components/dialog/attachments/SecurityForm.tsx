import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CheckBox from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import { FieldArray, useFormikContext } from 'formik';
import { SecurityReason } from 'interfaces/useSecurityApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

// `security_reason_id` is a string so `isSecurityReasonSelected` makes correct comparison
// formik forms turns int values into string internally
export interface ISecurityForm {
  security_reasons: {
    security_reason_id: string;
  }[];
}

export const SecurityInitialValues: ISecurityForm = {
  security_reasons: []
};

export const SecurityYupSchema = () => {
  return yup.object().shape({
    security_reasons: yup.array().of(
      yup.object().shape({
        security_reason_id: yup.number()
      })
    )
  });
};

export interface ISecurityFormProps {
  /**
   * All security reasons available to the user to select from.
   *
   * @type {SecurityReason[]}
   * @memberof ISecurityFormProps
   */
  availableSecurityReasons: SecurityReason[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const SecurityForm: React.FC<ISecurityFormProps> = (props) => {
  const { values } = useFormikContext<ISecurityForm>();

  const isSecurityReasonSelected = (securityReasonId: number): boolean => {
    return values.security_reasons.map((item) => item.security_reason_id).includes(`${securityReasonId}`);
  };

  const getIndexOfSelectedSecurityReason = (securityReasonId: number): number => {
    return values.security_reasons.map((item) => item.security_reason_id).indexOf(`${securityReasonId}`);
  };

  // expiry dates require more work before being implemented
  // const getExpiryDateString = (expiryDate?: string | null): string => {
  //   if (expiryDate) {
  //     return getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, expiryDate);
  //   }

  //   return 'N/A';
  // };

  return (
    <FieldArray
      name="security_reasons"
      render={(arrayHelpers) => (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="70" padding="checkbox"></TableCell>
                <TableCell width="200">Category</TableCell>
                <TableCell>Reason</TableCell>
                {/* <TableCell width="160">Expiry Date</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.availableSecurityReasons.map((availableSecurityReason, index) => {
                return (
                  <TableRow key={availableSecurityReason.security_reason_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        name={`security_reasons.[${index}].security_reason_id`}
                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                        checkedIcon={<CheckBox fontSize="small" />}
                        color="primary"
                        style={{ marginRight: 8 }}
                        checked={isSecurityReasonSelected(availableSecurityReason.security_reason_id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            arrayHelpers.push({ security_reason_id: availableSecurityReason.security_reason_id });
                          } else {
                            arrayHelpers.remove(
                              getIndexOfSelectedSecurityReason(availableSecurityReason.security_reason_id)
                            );
                          }
                        }}
                        value={availableSecurityReason.security_reason_id}
                      />
                    </TableCell>
                    {/* <TableCell>{availableSecurityReason.category}</TableCell> */}
                    <TableCell>Persecution or Harm</TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 700 }}>{availableSecurityReason.reasonTitle}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {availableSecurityReason.reasonDescription}
                      </Typography>
                    </TableCell>
                    {/* <TableCell>{getExpiryDateString(availableSecurityReason.expirationDate)}</TableCell> */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    />
  );
};

export default SecurityForm;
