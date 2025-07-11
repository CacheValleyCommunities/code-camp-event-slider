# /bin/bash
kill $(lsof -t -i:8081) || true