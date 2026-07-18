import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const composeArgs = ["compose", "-p", "petcare-api-test", "-f", "docker-compose.test.yml"];
const packageManagerCli = process.env.npm_execpath;
const testDatabaseUrl = "postgresql://petcare:petcare@127.0.0.1:5433/petcare_test?schema=public";
const testScript = process.argv.includes("--coverage") ? "test:e2e:coverage" : "test:e2e";
const env = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
  NODE_ENV: "test",
  AI_ENABLED: "false",
  BOOKING_REMINDER_ENABLED: "false"
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false,
    ...options
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function assertTestDatabase() {
  const url = new URL(testDatabaseUrl);
  if (url.hostname !== "127.0.0.1" || url.port !== "5433" || url.pathname !== "/petcare_test") {
    throw new Error("Refusing to run: API tests must use 127.0.0.1:5433/petcare_test");
  }
}

function runPackageManager(args) {
  if (packageManagerCli) {
    run(process.execPath, [packageManagerCli, ...args]);
    return;
  }

  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  run(command, args, { shell: process.platform === "win32" });
}

let exitCode = 0;
try {
  assertTestDatabase();
  run("docker", [...composeArgs, "up", "-d", "--wait"]);
  runPackageManager(["--filter", "@petcare/api", "test:e2e:prepare"]);
  runPackageManager(["--filter", "@petcare/api", testScript]);
} catch (error) {
  exitCode = 1;
  console.error(error instanceof Error ? error.message : error);
} finally {
  const cleanup = spawnSync("docker", [...composeArgs, "down", "-v", "--remove-orphans"], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false
  });
  if (cleanup.status !== 0) exitCode = 1;
}

process.exitCode = exitCode;
