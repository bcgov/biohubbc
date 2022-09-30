import { queries } from "../queries/queries";
import { BaseRepository } from "./base-repository";

export interface IOccurrenceSubmission {
    occurrence_submission_id: number;
    survey_id: number;
    template_methodology_species_id: number;
    source: string;
    input_key: string;
    input_file_name: string;
    output_key: string;
    output_file_name: string;
}

export class OccurrenceRepository extends BaseRepository {


    async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission | null> {
        let response: IOccurrenceSubmission | null = null
        const sql = queries.survey.getSurveyOccurrenceSubmissionSQL(submissionId);

        if (sql) {
            response = (await this.connection.query<IOccurrenceSubmission>(sql.text, sql.values)).rows[0]
        }

        return response;
    }
}