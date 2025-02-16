const { exec } = require("child_process");
const path = require("path");
const process = require("process");
const fs = require("fs");

function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running "${cmd}" in ${cwd}`);
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing "${cmd}" in ${cwd}: ${error.message}`);
        reject(error);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

function ensureEnvFile(cwd) {
  const envPath = path.join(cwd, ".env");
  const exampleEnvPath = path.join(cwd, ".env.example");

  if (!fs.existsSync(envPath) && fs.existsSync(exampleEnvPath)) {
    fs.copyFileSync(exampleEnvPath, envPath);
    console.log(`Created .env file in ${cwd}`);
  }
}

async function checkAndInstallGlobalDependencies() {
  console.log("Checking global dependencies...");
  // For pm2, you still want it globally:
  await runCommand("npm list -g pm2 || npm install -g pm2", process.cwd());
}

async function setup() {
  try {
    const projectRoot = process.cwd();
    const backendDir = path.join(projectRoot, "backend");
    const frontendDir = path.join(projectRoot, "react-app");

    await checkAndInstallGlobalDependencies();

    console.log("Ensuring .env files exist...");
    ensureEnvFile(backendDir);
    ensureEnvFile(frontendDir);

    console.log("Setting up Backend...");
    // 1. Install all backend dependencies (uses local TypeScript in devDependencies)
    await runCommand("npm ci", backendDir);
    // 2. Compile TypeScript using npx (this uses the local TypeScript)
    await runCommand("npx tsc", backendDir);

    console.log("Setting up Frontend...");
    await runCommand("npm ci", frontendDir);

    console.log("Setup complete!");
    console.log("To start the backend, navigate to the backend folder and run: npm run dev");
    console.log("To start the frontend, navigate to the react-app folder and run: npm run dev");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setup();
