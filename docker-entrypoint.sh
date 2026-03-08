#!/bin/sh

# Check if the mapped directory is empty by looking for index.html
if [ ! -f "/app/html/index.html" ]; then
    echo "First run detected. Populating /app/html with frontend files..."
    cp -R /app/frontend/* /app/html/
    echo "Files copied successfully."
else
    echo "Existing frontend files detected in /app/html. Skipping copy."
fi

# Hand over control to the Node application
exec "$@"
