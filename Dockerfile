# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the dependencies
RUN npm ci --omit=dev 

# Copy the rest of the application files to the container
COPY . .

# Start the bot
CMD [ "node", "bot.js" ]
