# Dockerize the react-project
FROM node:latest

ARG PORT
ENV PORT $PORT

ARG SOCKET_API 
ENV SOCKET_API $SOCKET_API

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app/
RUN npm install

# Expose the port the app runs in
EXPOSE ${PORT}