FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

WORKDIR /app

# Copy the backend code
COPY backend/ ./backend/

# Copy the frontend code into /app/frontend so it can be used to populate /app/html
COPY assets/ ./frontend/assets/
COPY index.html ./frontend/
COPY manifest.json ./frontend/
COPY sw.js ./frontend/
COPY setup.html ./frontend/

# Create the directories and assign ownership to UID 99 (nobody) and GID 100 (users)
RUN mkdir -p /app/data /app/html /app/frontend && \
    chown -R 99:100 /app

COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh && \
    chown 99:100 /app/docker-entrypoint.sh

# Switch to UID 99 and GID 100 to perfectly match the host storage permissions
USER 99:100

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "backend/server.js"]
