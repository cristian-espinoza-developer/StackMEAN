// Configuración de PM2 para producción (EC2).
// Uso directo en el servidor: pm2 start ecosystem.config.cjs && pm2 save
// Uso con deploy (desde backend/):
//   pm2 deploy ecosystem.config.cjs production setup   (solo la primera vez)
//   pm2 deploy ecosystem.config.cjs production         (cada despliegue)
const DEPLOY_PATH = '/home/ubuntu/StackMEAN';

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
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['100.59.68.175'],
      ref: 'origin/main',
      repo: 'https://github.com/cristian-espinoza-developer/StackMEAN.git',
      path: DEPLOY_PATH,
      // El .env no está en git: se deja una sola vez en DEPLOY_PATH/shared/.env
      'post-setup': `mkdir -p ${DEPLOY_PATH}/shared`,
      // Se ejecuta en DEPLOY_PATH/current (raíz del repo)
      'post-deploy': [
        `cp ${DEPLOY_PATH}/shared/.env backend/.env`,
        'cd backend && npm ci',
        'cd frontend && npm ci && npm run build',
        'pm2 startOrReload backend/ecosystem.config.cjs && pm2 save'
      ].join(' && ')
    }
  }
};
