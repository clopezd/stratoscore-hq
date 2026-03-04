module.exports = {
  apps: [
    {
      name: 'stratoscore-agent',
      script: './dist/index.js',
      cwd: '/home/cmarioia/proyectos/stratoscore-hq/agent-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
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
