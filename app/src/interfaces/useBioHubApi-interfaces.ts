/**
 * Create new activity endpoint object.
 *
 * @export
 * @interface IActivity
 */
export interface ICreateActivity {
  tags: string[];
  template_id: string;
  form_data: any;
}

/**
 * Activity object.
 *
 * @export
 * @interface IActivity
 */
export interface IActivity {
  activity_id: string;
  tags: string[];
  template_id: string;
  form_data: any;
}

/**
 * Create new tempalte endpoint object.
 *
 * @export
 * @interface ITemplate
 */
export interface ICreateTemplate {
  name: string;
  description: string;
  tags: string[];
  data_template: any;
  ui_template: any;
}

/**
 * Tempalte object.
 *
 * @export
 * @interface ITemplate
 */
export interface ITemplate {
  template_id: string;
  name: string;
  description: string;
  tags: string[];
  data_template: any;
  ui_template: any;
}
