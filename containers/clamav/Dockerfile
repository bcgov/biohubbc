FROM registry.access.redhat.com/rhel

ENV SUMMARY="ClamAV for running in OpenShift 4" \
    DESCRIPTION="Clam AntiVirus is an open source (GPLv2) anti-virus toolkit. The core of the package is an anti-virus engine available in a form of shared library."

LABEL summary="$SUMMARY" \
      description="$DESCRIPTION" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="rhel_clamav" \
      com.redhat.component="rhel" \
      name="registry.access.redhat.com/rhel" \
      version="1" \
      com.redhat.license_terms="https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI"

# Copy entitlements and subscription manager configurations
# https://github.com/BCDevOps/OpenShift4-Migration/issues/15
COPY ./etc-pki-entitlement /etc/pki/entitlement
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

RUN rm /etc/rhsm-host && \
    yum repolist > /dev/null && \
    yum install -y yum-utils gettext && \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && \
    subscription-manager repos --enable "rhel-*-optional-rpms" --enable "rhel-*-extras-rpms" && \
    yum repolist > /dev/null && \
    INSTALL_PKGS="autoconf \
      automake \
      bzip2 \
      gcc-c++ \
      gdb \
      git \
      lsof \
      make \
      patch \
      procps-ng \
      unzip \
      wget \
      which \
      clamav \
      clamd" && \
    yum -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    yum -y clean all --enablerepo='*'

COPY config/clamd.conf /etc/clamd.conf
COPY config/freshclam.conf /etc/freshclam.conf

RUN mkdir /opt/app-root
RUN mkdir /opt/app-root/src
RUN chown -R 1001:0 /opt/app-root/src
RUN chmod -R ug+rwx /opt/app-root/src

# initial update of av databases - Sourced from a temporary location due to DOS protection issues
RUN wget -t 5 -T 99999 -O /opt/app-root/src/main.cvd https://clamav-biohub.s3.ca-central-1.amazonaws.com/main.cvd && \
    wget -t 5 -T 99999 -O /opt/app-root/src/daily.cvd https://clamav-biohub.s3.ca-central-1.amazonaws.com/daily.cvd && \
    wget -t 5 -T 99999 -O /opt/app-root/src/bytecode.cvd https://clamav-biohub.s3.ca-central-1.amazonaws.com/bytecode.cvd && \
    chown clamupdate:clamupdate /opt/app-root/src/*.cvd

# Remove entitlements and Subscription Manager configs
RUN rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm

USER 1001

EXPOSE 3310

CMD clamd -c /etc/clamd.conf
