module.exports = {
  apps: [
    {
      name: 'stratoscore-agent',
      script: './start.sh',
      interpreter: '/bin/bash',
      cwd: '/home/cmarioia/proyectos/stratoscore-hq/agent-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Estrategia de reinicio: exponential backoff
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,
      // Kill timeout aumentado para que el proceso tenga tiempo de limpiar
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PATH: '/home/cmarioia/.nvm/versions/node/v20.20.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        // Prevent claude CLI subprocess from detecting a nested Claude Code session
        CLAUDECODE: '',
        CLAUDE_CODE_ENTRYPOINT: '',
      },
    },
  ],
}
