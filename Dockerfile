# Use the official Node.js image as the base image
FROM arm32v7/node:19.7

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY . .

# Install the dependencies
RUN apt install python3
RUN npm install

# Start the bot
CMD [ "node", "bot.js" ]
