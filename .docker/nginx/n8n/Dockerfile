FROM nginx:stable-alpine

RUN mkdir -p /usr/app

WORKDIR /usr/app

# remove any existing conf file
RUN rm /etc/nginx/conf.d/default.conf

# copy our nginx conf file
COPY /dev.conf /etc/nginx/conf.d
