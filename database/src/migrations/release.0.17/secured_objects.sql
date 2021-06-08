-- secured_objects.sql
ALTER TABLE biohub.activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.activity
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.activity
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.project ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.project
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.project
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.project_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.project_activity
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.project_activity
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.project_attachment ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.project_attachment
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.project_attachment
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.survey ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.survey
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.survey
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.survey_attachment ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.survey_attachment
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.survey_attachment
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.survey_occurrence ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_admin
    ON biohub.survey_occurrence
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
CREATE POLICY public
    ON biohub.survey_occurrence
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (security_token is NULL);

ALTER TABLE biohub.webform_draft ENABLE ROW LEVEL SECURITY;
CREATE POLICY only_owner
    ON biohub.webform_draft
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (su_id = biohub.api_get_context_user_id());
CREATE POLICY only_admin
    ON biohub.webform_draft
    AS PERMISSIVE
    FOR ALL
    TO biohub_api
    USING (biohub.api_get_context_system_user_role_id() = 1);
