#!/bin/sh

set -eu

data_dir="${DATA_DIR:-/app/data}"
frontend_dir="${FRONTEND_DIR:-/app/html}"
frontend_seed_dir="${FRONTEND_SEED_DIR:-/app/html-seed}"
runtime_user="${RUNTIME_USER:-node}"

run_shell_as_runtime_user() {
    shell_command="$1"
    shift

    if [ "$(id -u)" -eq 0 ]; then
        current_dir=$(pwd)
        su "$runtime_user" -s /bin/sh -c 'cd "$1" && shift && command="$1" && shift && exec sh -c "$command" runtime-sh "$@"' -- argv0 "$current_dir" "$shell_command" "$@"
        return
    fi

    sh -c "$shell_command" runtime-sh "$@"
}

run_as_runtime_user() {
    if [ "$(id -u)" -eq 0 ]; then
        current_dir=$(pwd)
        su "$runtime_user" -s /bin/sh -c 'cd "$1" && shift && exec "$@"' -- argv0 "$current_dir" "$@"
        return
    fi

    exec "$@"
}

runtime_user_can_write_dir() {
    dir="$1"
    run_shell_as_runtime_user 'test -w "$1"' "$dir"
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
    run_shell_as_runtime_user 'cp -R "$1"/. "$2"' "$frontend_seed_dir" "$frontend_dir"
    echo "Files copied successfully."
else
    echo "Existing frontend files detected in $frontend_dir. Skipping copy."
fi

# Hand over control to the Node application
run_as_runtime_user "$@"
