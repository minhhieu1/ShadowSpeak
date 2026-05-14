# Scripts Directory

This directory stores utility scripts that support development, testing, and CI/CD processes for the **ShadowSpeak** project. Scripts include build helpers, deployment automation, test runners, and other convenience tools.

---

## `mock_server`

A small Bash helper that starts and stops the **mockserver** instance used by the front‑end during local development.

### Location

`scripts/mock_server`

### Description

- **start** – Launches the mock server (default port **3001**) in the background. If a server is already listening on that port, the script will kill the existing process and restart it.
- **stop** – Stops the running mock server by reading the PID stored in `/tmp/mock_server.pid` and terminating it.

The script stores the PID of the started process in `/tmp/mock_server.pid` so that the **stop** command can reliably shut it down.

### Usage

```bash
# From the repository root
./scripts/mock_server start   # start (or restart) the mock server
./scripts/mock_server stop    # stop the mock server
```

You can also run the script in the background directly:

```bash
./scripts/mock_server start &
```

The server will continue running after the terminal returns.

### Example workflow

```bash
# Start the server (will restart if already running)
./scripts/mock_server start

# Verify it is up (example request)
curl -s -H "Authorization: Bearer jwt-token" http://localhost:3001/v1/me | python3 -m json.tool

# When finished, stop it
./scripts/mock_server stop
```

### Notes

- The script assumes **Node.js** is installed and that the mock server code lives in `helper/mockserver/server.js`.
- The default port can be overridden by setting the `PORT` environment variable before invoking the script, e.g. `PORT=4000 ./scripts/mock_server start`.
- If the PID file is missing, the `stop` command will warn that the server may not be running.

---

Feel free to add additional scripts to this directory as the project evolves.
