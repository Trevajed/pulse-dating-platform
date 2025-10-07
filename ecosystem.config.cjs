// PM2 Configuration for PULSE Dating Platform Development
module.exports = {
  apps: [
    {
      name: 'pulse-dating-mvp',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Disable PM2 file monitoring (wrangler handles hot reload)
      instances: 1, // Single instance for development
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      // Logging configuration
      log_file: '/home/user/webapp/logs/pulse-combined.log',
      out_file: '/home/user/webapp/logs/pulse-out.log',
      error_file: '/home/user/webapp/logs/pulse-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Memory and CPU limits
      max_memory_restart: '500M'
    }
  ]
}