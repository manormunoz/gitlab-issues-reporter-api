module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "admin_api_dev",
      script: "dist/index.js",
      //instances: "1",
      //exec_mode: "cluster",
      //trace: true,
      env: {
        NODE_ENV: "dev"
      },
      "error_file": "./logs/services-dev-err.log",
      "out_file": "./logs/services-dev-out.log",
      "pid_file": "./logs/services-dev.pid"
    },
    {
      name: "admin_api",
      script: "dist/src/index.js",
      trace: true,
      env: {
        NODE_ENV: "production"
      },
      "error_file": "./logs/services-production-err.log",
      "out_file": "./logs/services-production-out.log",
      "pid_file": "./logs/services-production.pid"
    },
    {
      name: "admin_api_test",
      script: "dist/src/index.js",
      trace: true,
      env: {
        NODE_ENV: "test"
      },
      "error_file": "./logs/services-test-err.log",
      "out_file": "./logs/services-test-out.log",
      "pid_file": "./logs/services-test.pid"
    }
  ],

}
