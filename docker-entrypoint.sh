#!/bin/sh

set -eu

data_dir="${DATA_DIR:-/app/data}"
frontend_dir="${FRONTEND_DIR:-/app/html}"
frontend_seed_dir="${FRONTEND_SEED_DIR:-/app/html-seed}"
runtime_user="${RUNTIME_USER:-node}"

run_as_runtime_user() {
    if [ "$(id -u)" -eq 0 ]; then
        su "$runtime_user" -s /bin/sh -c 'exec "$@"' -- sh "$@"
        return
    fi

    exec "$@"
}

runtime_user_can_write_dir() {
    dir="$1"

    if [ "$(id -u)" -eq 0 ]; then
        su "$runtime_user" -s /bin/sh -c 'test -w "$1"' -- sh "$dir"
        return
    fi

    [ -w "$dir" ]
}

ensure_writable_dir() {
    dir="$1"
    label="$2"

    mkdir -p "$dir"

    if [ "$(id -u)" -eq 0 ]; then
        if ! chown "$runtime_user":"$runtime_user" "$dir"; then
            echo "Error: ${label} directory '$dir' could not be assigned to ${runtime_user}." >&2
            echo "Please update the host volume permissions for the mapped path and restart the container." >&2
            exit 1
        fi
    fi

    if ! runtime_user_can_write_dir "$dir"; then
        echo "Error: ${label} directory '$dir' is not writable by runtime user '${runtime_user}'." >&2
        echo "Please update the host volume permissions for the mapped path and restart the container." >&2
        exit 1
    fi
}

ensure_writable_dir "$data_dir" "Data"
ensure_writable_dir "$frontend_dir" "Frontend"

# Check if the mapped directory is empty by looking for index.html
if [ ! -f "$frontend_dir/index.html" ]; then
    echo "First run detected. Populating $frontend_dir with frontend files..."

    if [ "$(id -u)" -eq 0 ]; then
        su "$runtime_user" -s /bin/sh -c 'cp -R "$1"/. "$2"/' -- sh "$frontend_seed_dir" "$frontend_dir"
    else
        cp -R "$frontend_seed_dir"/. "$frontend_dir"/
    fi

    echo "Files copied successfully."
else
    echo "Existing frontend files detected in $frontend_dir. Skipping copy."
fi

# Hand over control to the Node application
run_as_runtime_user "$@"
