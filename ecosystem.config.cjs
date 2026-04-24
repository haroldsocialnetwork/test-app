module.exports = {
  apps: [
    {
      name: 'nestjs-backend',
      cwd: '/home/user/webapp/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3998,
        DATABASE_URL: 'file:/home/user/webapp/backend/prisma/dev.db',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'react-frontend',
      cwd: '/home/user/webapp',
      script: 'server.cjs',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
