require("dotenv").config();
const { execSync } = require("child_process");
const prompts = require("prompts");
const fs = require("fs");
const path = require("path");

function updateTauriVersion(newVersion) {
  const tauriConfigPath = path.join(
    __dirname,
    "..",
    "src-tauri",
    "tauri.conf.json"
  );

  const tauriConfig = JSON.parse(
    fs.readFileSync(tauriConfigPath, "utf-8")
  );

  tauriConfig.version = newVersion;

  fs.writeFileSync(
    tauriConfigPath,
    JSON.stringify(tauriConfig, null, 2) + "\n"
  );

  console.log(`📝 Updated tauri.conf.json → v${newVersion}`);
}

(async () => {
  const response = await prompts({
    type: "select",
    name: "versionType",
    message: "What type of release is this?",
    choices: [
      { title: "Patch", value: "patch" },
      { title: "Minor", value: "minor" },
      { title: "Major", value: "major" }
    ]
  });

  if (!response.versionType) {
    console.log("❌ Release cancelled.");
    process.exit(1);
  }

  try {
    // 1. Bump version WITHOUT creating git commit/tag automatically
    const cmd = `npm version ${response.versionType} --no-git-tag-version`;
    console.log(`🏗 Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });

    // 2. Read new version
    const pkg = require("../package.json");
    const newVersion = pkg.version;

    // 3. Sync tauri version
    updateTauriVersion(newVersion);

    // 4. Commit EVERYTHING in one clean commit
    execSync("git add .", { stdio: "inherit" });
    execSync(
      `git commit -m "chore: bump version to ${newVersion}"`,
      { stdio: "inherit" }
    );

    // 5. Create tag AFTER commit (IMPORTANT)
    execSync(`git tag v${newVersion}`, { stdio: "inherit" });

    // 6. Push commit + tags
    console.log("🚀 Pushing to git...");
    execSync("git push", { stdio: "inherit" });
    execSync("git push --tags", { stdio: "inherit" });

    console.log("✅ Release complete!");

    const repo = process.env.GITHUB_REPOSITORY;
    console.log(`🔗 https://github.com/${repo}/actions`);
  } catch (error) {
    console.error("🔥 Release failed:", error.message);
    process.exit(1);
  }
})();