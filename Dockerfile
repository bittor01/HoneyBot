# Use an official Node.js runtime as a parent image
# Using node:20-slim to keep the image size small
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using 'npm ci' for a clean, reproducible install from the lockfile
RUN npm ci

# Copy the rest of the application code
COPY src/ ./src/

# Create a data directory for persistence
# This directory will be used to store the counts.json file
RUN mkdir -p /app/data

# Define the command to run the application
CMD [ "npm", "start" ]
