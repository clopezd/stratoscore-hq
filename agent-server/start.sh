#\!/bin/bash
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
export PATH="$HOME/.nvm/versions/node/v20.20.1/bin:$PATH"
export $(cat .env | xargs)
node dist/index.js
