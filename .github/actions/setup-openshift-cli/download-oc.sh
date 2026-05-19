#!/usr/bin/env bash
# Download and extract the OpenShift client for the current machine architecture.
set -euo pipefail
: "${OC_VERSION:?}"
: "${OC_CACHE_DIR:?}"
: "${RUNNER_ARCH:?}"

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) OC_TARBALL="openshift-client-linux-${OC_VERSION}.tar.gz" ;;
  aarch64 | arm64) OC_TARBALL="openshift-client-linux-arm64-${OC_VERSION}.tar.gz" ;;
  ppc64le) OC_TARBALL="openshift-client-linux-ppc64le-${OC_VERSION}.tar.gz" ;;
  *) echo "Unsupported architecture: $ARCH" >&2 && exit 1 ;;
esac

mkdir -p "${OC_CACHE_DIR}/${OC_VERSION}/${RUNNER_ARCH}"
curl -fsSL "https://mirror.openshift.com/pub/openshift-v4/clients/ocp/${OC_VERSION}/${OC_TARBALL}" \
  -o /tmp/openshift-client.tar.gz
tar -xzf /tmp/openshift-client.tar.gz -C /tmp oc
mv /tmp/oc "${OC_CACHE_DIR}/${OC_VERSION}/${RUNNER_ARCH}/oc"
chmod +x "${OC_CACHE_DIR}/${OC_VERSION}/${RUNNER_ARCH}/oc"
