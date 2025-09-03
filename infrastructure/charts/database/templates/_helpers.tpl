{{/*
Expand the name of the chart.
*/}}
{{- define "app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create app suffix
If environment.id is "deploy" AND environment.name is "dev", the value should be "-dev-deploy"
If environment.id is "deploy" AND environment.name is not "dev", the value should be "-ENV"
If environment.id is not "deploy", the value should be "-dev-1234"
*/}}
{{- define "app.suffix" -}}
{{- if and .Values.environment.id (eq (toString .Values.environment.id) "deploy") (eq .Values.environment.name "dev") }}
{{- printf "-%s-%s" .Values.environment.name (toString .Values.environment.id) | trunc 63 | trimSuffix "-" }}
{{- else if and .Values.environment.id (eq (toString .Values.environment.id) "deploy") (ne .Values.environment.name "dev") }}
{{- printf "-%s" .Values.environment.name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "-%s-%s" .Values.environment.name (toString .Values.environment.changeId) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s%s" .Values.app.name (include "app.suffix" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "app.labels" -}}
app: {{ include "app.fullname" . }}
app-name: {{ .Values.app.name }}
env-id: {{ .Values.environment.id }}
env-name: {{ .Values.environment.name }}
env-ts: {{ .Values.environment.ts }}
helm.sh/chart: {{ include "app.chart" . }}
{{ include "app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Image tag
*/}}
{{- define "app.imageTag" -}}
{{- if and .Values.environment.id (eq (toString .Values.environment.id) "deploy") }}
{{- printf "build-%s-%s-%s" .Chart.AppVersion (toString .Values.environment.changeId) .Values.environment.name }}
{{- else }}
{{- printf "build-%s-%s" .Chart.AppVersion (toString .Values.environment.changeId) }}
{{- end }}
{{- end }}

{{/*
DB Host
*/}}
{{- define "dbHost" -}}
biohubbc-db-postgresql{{ include "app.suffix" . }}
{{- end }}

{{/*
API Host
*/}}
{{- define "apiHost" -}}
{{- if .Values.app.apiHost }}
{{- printf "%s" .Values.app.apiHost }}
{{- else if and .Values.route.host (eq (toString .Values.app.name) "biohubbc-api") }}
{{- printf "%s" .Values.route.host }}
{{- else }}
{{- printf "biohubbc-api-%s-%s-%s.apps.silver.devops.gov.bc.ca" (toString .Values.environment.changeId) .Values.environment.licensePlate .Values.environment.name }}
{{- end }}
{{- end }}

{{/*
App Host
*/}}
{{- define "appHost" -}}
{{- if .Values.app.appHost }}
{{- printf "%s" .Values.app.appHost }}
{{- else if and .Values.route.host (eq (toString .Values.app.name) "biohubbc-app") }}
{{- printf "%s" .Values.route.host }}
{{- else }}
{{- printf "biohubbc-app-%s-%s-%s.apps.silver.devops.gov.bc.ca" (toString .Values.environment.changeId) .Values.environment.licensePlate .Values.environment.name }}
{{- end }}
{{- end }}