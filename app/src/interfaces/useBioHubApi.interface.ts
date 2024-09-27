export type WarningSchema = {
  name: string;
  message: string;
  data: Record<string, unknown>;
  errors?: (string | Record<string, unknown>)[];
};
