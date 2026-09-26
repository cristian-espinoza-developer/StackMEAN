// Configuración de PM2 para producción (EC2).
// Uso: pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'backend-empleados',
      cwd: __dirname,
      script: 'npm',
      args: 'start', // tsx --env-file=.env src/index.ts
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      time: true // timestamps en los logs
    }
  ]
};
