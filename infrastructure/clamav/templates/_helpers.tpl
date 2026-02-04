{{/*
Expand the name of the chart
*/}}
{{- define "clamav.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Namespace
*/}}
{{- define "environment.namespace" -}}
{{- printf "%s-%s" .Values.environment.licensePlate .Values.environment.name }}
{{- end }}

{{/*
Create app suffix
If environment.id is "deploy" AND environment.name is "dev", the value should be "-dev-deploy"
If environment.id is "deploy" AND environment.name is not "dev", the value should be "-ENV"
If environment.id is not "deploy", the value should be "-dev-1234"
*/}}
{{- define "clamav.suffix" -}}
{{- if and .Values.environment.id (eq (toString .Values.environment.id) "deploy") (eq .Values.environment.name "dev") }}
{{- printf "-%s-%s" .Values.environment.name (toString .Values.environment.id) | trunc 63 | trimSuffix "-" }}
{{- else if and .Values.environment.id (eq (toString .Values.environment.id) "deploy") (ne .Values.environment.name "dev") }}
{{- printf "-%s" .Values.environment.name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "-%s-%s" .Values.environment.name .Values.environment.changeId | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create a default fully qualified app name
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
Note: ClamAV uses a simple name without environment suffix since each environment
has its own namespace, avoiding any naming conflicts.
*/}}
{{- define "clamav.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Values.app.name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label
*/}}
{{- define "clamav.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
Stable labels only - no changeId or ts. ClamAV rarely changes between deployments,
so we avoid including deployment-specific values that would cause unnecessary churn
in the Deployment object. Rollouts happen only when ClamAV config (image, resources, etc.) changes.
*/}}
{{- define "clamav.labels" -}}
app: {{ include "clamav.fullname" . }}
app-name: {{ .Values.app.name }}
env-id: {{ .Values.environment.id | quote }}
env-name: {{ .Values.environment.name | quote }}
helm.sh/chart: {{ include "clamav.chart" . }}
{{ include "clamav.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Common annotations
*/}}
{{- define "clamav.annotations" -}}
meta.helm.sh/release-name: {{ .Release.Name | quote }}
meta.helm.sh/release-namespace: {{ include "environment.namespace" . }}
{{- end }}

{{/*
Selector labels
Use stable env name only (dev/test/prod) - never changeId or ts.
ClamAV pod template stays identical across deployments so no unnecessary rollouts.
*/}}
{{- define "clamav.selectorLabels" -}}
app.kubernetes.io/name: {{ include "clamav.name" . }}
app.kubernetes.io/instance: {{ .Values.environment.name | quote }}
{{- end }}

{{/*
Image tag
For static deployments (id=deploy), we use the environment name
Otherwise we use the changeId (PR number)
*/}}
{{- define "clamav.imageTag" -}}
{{- .Values.image.tag }}
{{- end }}
