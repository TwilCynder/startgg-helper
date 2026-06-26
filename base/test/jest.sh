#! bash

NODE_ARGS="--experimental-vm-modules --no-warnings"
JEST=node_modules/jest/bin/jest.js

for arg in "$@"; do
    case "$arg" in 
        -s | --silent) ARGS="$ARGS --silent" ;;
        -q | --quick) export QUICK=true ;;
    esac
done

echo "Starting jest as $JEST $ARGS"
node $NODE_ARGS $JEST $ARGS