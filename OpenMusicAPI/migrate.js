const { exec } = require('child_process');

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}\n`, stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });

    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
};

const migrate = async () => {
  try {
    console.log('Running migrations...');

    // Run down migrations
    await runCommand('npx node-pg-migrate down -f ./migrations/20240724120000_albums_table.js');
    await runCommand('npx node-pg-migrate down -f ./migrations/20240724121000_songs_table.js');
    
    // Run up migrations
    await runCommand('npx node-pg-migrate up -f ./migrations/20240724120000_albums_table.js');
    await runCommand('npx node-pg-migrate up -f ./migrations/20240724121000_songs_table.js');

    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migrations failed:', error);
    process.exit(1);
  }
};

migrate();
