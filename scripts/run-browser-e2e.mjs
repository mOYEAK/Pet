import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const composeProject = "petcare-browser-e2e";
const composeArgs = [
  "compose",
  "-p",
  composeProject,
  "-f",
  "docker-compose.test.yml",
];
const packageManagerCli = process.env.npm_execpath;
const testDatabaseUrl =
  "postgresql://petcare:petcare@127.0.0.1:5433/petcare_test?schema=public";
const env = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
  NODE_ENV: "test",
  AI_ENABLED: "false",
  BOOKING_REMINDER_ENABLED: "false",
  E2E_API_URL: "http://127.0.0.1:3100",
  E2E_ADMIN_URL: "http://127.0.0.1:4173",
  E2E_MINIAPP_URL: "http://127.0.0.1:4174",
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status}`,
    );
  }
}

function assertTestDatabase() {
  const url = new URL(testDatabaseUrl);
  if (
    url.hostname !== "127.0.0.1" ||
    url.port !== "5433" ||
    url.pathname !== "/petcare_test" ||
    composeProject !== "petcare-browser-e2e"
  ) {
    throw new Error(
      "Refusing to run: browser E2E must use 127.0.0.1:5433/petcare_test",
    );
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

function cleanup() {
  return spawnSync(
    "docker",
    [...composeArgs, "down", "-v", "--remove-orphans"],
    {
      cwd: root,
      env,
      stdio: "inherit",
      shell: false,
    },
  );
}

let exitCode = 0;
try {
  assertTestDatabase();
  const initialCleanup = cleanup();
  if (initialCleanup.status !== 0) {
    throw new Error(
      "Unable to clean the isolated browser E2E database container",
    );
  }
  run("docker", [...composeArgs, "up", "-d", "--wait"]);
  runPackageManager(["--filter", "@petcare/api", "test:e2e:prepare"]);
  runPackageManager(["--filter", "@petcare/api", "prisma:seed"]);
  runPackageManager(["--filter", "@petcare/shared", "build"]);
  runPackageManager(["--filter", "@petcare/agent", "build"]);
  runPackageManager(["--filter", "@petcare/api", "build"]);
  runPackageManager(["exec", "playwright", "test", ...process.argv.slice(2)]);
} catch (error) {
  exitCode = 1;
  console.error(error instanceof Error ? error.message : error);
} finally {
  const cleanupResult = cleanup();
  if (cleanupResult.status !== 0) exitCode = 1;
}

process.exitCode = exitCode;
