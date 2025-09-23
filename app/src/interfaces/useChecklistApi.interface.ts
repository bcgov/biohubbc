export interface IGetSurveyChecklistResponse {
  checklist: IGetSurveyChecklist;
}

export interface IGetSurveyChecklistItem {
  count: number;
  applicable: boolean;
  checklist_item_name: string;
}

export interface IGetSurveyChecklist {
  sampling: {
    sites: IGetSurveyChecklistItem;
    techniques: IGetSurveyChecklistItem;
    periods: IGetSurveyChecklistItem;
  };
  data: {
    observations: IGetSurveyChecklistItem;
    telemetry: {
      devices: IGetSurveyChecklistItem;
      deployments: IGetSurveyChecklistItem;
      locations: IGetSurveyChecklistItem;
    };
    habitat: IGetSurveyChecklistItem;
    animals: IGetSurveyChecklistItem;
  };
  attachments: IGetSurveyChecklistItem;
  progress_percentage: number;
}
