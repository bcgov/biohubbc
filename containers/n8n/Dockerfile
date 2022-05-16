FROM registry.access.redhat.com/ubi8/nodejs-16:latest
ARG N8N_VERSION
ENV HOME=/opt/app-root/src \
    TZ=America/Vancouver

RUN yum -y update \
  && yum -y install yum-utils \
  && rpm --import http://dl.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-8 \
  && yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

RUN yum install -y imagemagick
RUN mkdir -p $HOME
WORKDIR $HOME
RUN npm install -g n8n
RUN npm audit fix --force
ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH
VOLUME ${HOME}
VOLUME [ "/data" ]
WORKDIR /data
EXPOSE 5678/tcp
CMD ["n8n"]
