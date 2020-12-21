FROM node:10

ENV HOME_ROOT=/opt/app-root
ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

WORKDIR $HOME

# Copy the package files only
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Copy the rest of the files
COPY . .

# run the database migrations
CMD [ "npm", "run", "migrate:latest" ]
