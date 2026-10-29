const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const processes = [];

function ensureDependencies(dir, label) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`\n[${label}] Dependencies not installed yet. Running npm install...\n`);
    const result = spawnSync('npm', ['install'], {
      cwd: dir,
      stdio: 'inherit',
      shell: true,
    });

    if (result.status !== 0) {
      console.error(`\n[${label}] npm install failed.\n`);
      process.exit(result.status || 1);
    }
  }
}

function startProcess(command, args, cwd, label) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`\n[${label}] stopped by signal: ${signal}\n`);
    } else {
      console.log(`\n[${label}] exited with code ${code}\n`);
    }
  });

  processes.push(child);
  return child;
}

function shutdown() {
  processes.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  ensureDependencies(backendDir, 'Backend');
  ensureDependencies(frontendDir, 'Frontend');

  console.log('\nStarting backend...');
  startProcess('npm', ['start'], backendDir, 'Backend');

  console.log('Starting frontend...');
  startProcess('npm', ['run', 'dev', '--', '--host', '0.0.0.0'], frontendDir, 'Frontend');

  console.log('\nProject is running. Press Ctrl+C to stop.\n');
} catch (error) {
  console.error('Failed to start the project:', error);
  process.exit(1);
}
