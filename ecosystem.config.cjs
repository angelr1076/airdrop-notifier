module.exports = {
  apps: [
    {
      name: 'airdrop-notifier',
      script: 'src/main.mjs',
      interpreter: 'node',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
