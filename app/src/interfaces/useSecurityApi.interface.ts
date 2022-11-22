// TODO finish defining these interfaces/types

// A single security reason object
export type SecurityReason = {
  security_reason_id: number;
  category: string;
  reasonTitle: string;
  reasonDescription: string;
  expirationDate: string | null;
};

/**
 * Response from fetching security reasons.
 *
 * @export
 * @interface IGetSecurityReasonResponse
 */
export interface IGetSecurityReasonResponse {
  security_reasons: SecurityReason[];
}
