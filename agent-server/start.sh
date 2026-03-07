#!/bin/bash
# Wrapper para lanzar el agent server con entorno limpio.
# Borra las variables que impiden que Claude Agent SDK cree subsesiones.
unset CLAUDECODE
unset CLAUDE_CODE_ENTRYPOINT
unset CLAUDE_CODE_IS_SWE_BENCH

exec node /home/cmarioia/proyectos/stratoscore-hq/agent-server/dist/index.js
