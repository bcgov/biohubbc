# ########################################################################################################
# This DockerFile is used for Openshift deployments only.
# ########################################################################################################

#####################################################
# Stage 1: Create the build
#####################################################

FROM node:20 AS stage_1

USER 0

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

RUN chgrp -R 0 $HOME && \
    chmod -R g+rwX $HOME

WORKDIR $HOME

# Clean any existing generated file
RUN rm -rf ./build

# Copy the package files only
COPY package*.json ./

# Install all dependencies
RUN npm ci --include=dev

# Copy the rest of the files
COPY . ./

# Build app build
RUN npm run build

#####################################################
# Stage 2: Install production dependencies
#####################################################

FROM node:20 AS stage_2

USER 0

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

RUN chgrp -R 0 $HOME && \
    chmod -R g+rwX $HOME

WORKDIR $HOME

# Copy the package files only
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

#####################################################
# Stage 3: Create the final image
#####################################################

FROM node:20 as stage_3

USER 0

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

# See "Support arbitrary user ids"
# https://docs.openshift.com/container-platform/4.14/openshift_images/create-images.html#use-uid_create-images
RUN chgrp -R 0 $HOME && \
    chmod -R g+rwX $HOME

WORKDIR $HOME

# Copy dist files from stage_1
COPY --from=stage_1 ${HOME}/build/ ${HOME}/build/
COPY --from=stage_1 ${HOME}/server/ ${HOME}/server/

# Copy node_modules from stage_2
COPY --from=stage_2 ${HOME}/node_modules ${HOME}/node_modules
COPY --from=stage_2 ${HOME}/package*.json ./

ENV PATH ${HOME}/node_modules/.bin/:${HOME}/.npm-global/bin/:${HOME}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Application PORT
EXPOSE 7100

USER 1001

# RUN APP
CMD ["node", "server/index.js"]
