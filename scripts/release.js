import 'dotenv/config';
import { execSync } from 'child_process';
import prompts from 'prompts';
import fs from 'fs';
import path from 'path';

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'versionType',
    message: 'What type of release is this?',
    choices: [
      { title: 'Patch', value: 'patch' },
      { title: 'Minor', value: 'minor' },
      { title: 'Major', value: 'major' }
    ]
  });

  if (!response.versionType) {
    console.log('❌ Release cancelled.');
    process.exit(1);
  }

  try {
    // 1. Update package.json version
    console.log(`🏗 Bumping version (${response.versionType})...`);
    execSync(`npm version ${response.versionType} --no-git-tag-version`, { stdio: 'inherit' });

    // 2. Sync with tauri.conf.json
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const newVersion = pkg.version;
    const tauriConfPath = path.join('src-tauri', 'tauri.conf.json');
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    
    tauriConf.version = newVersion;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
    console.log(`✅ Synced tauri.conf.json to v${newVersion}`);

    // 3. Git commit and tag
    console.log('📝 Creating commit and tag...');
    execSync(`git add package.json ${tauriConfPath}`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to v${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

    console.log('🚀 Pushing to git...');
    execSync('git push', { stdio: 'inherit' });
    execSync('git push --follow-tags', { stdio: 'inherit' });

    console.log('✅ Release complete!');

    const repo = process.env.GITHUB_REPOSITORY;
    if (repo) {
      const workflowUrl = `https://github.com/${repo}/actions`;
      console.log(`🔗 Workflow: ${workflowUrl}`);
    }
  } catch (error) {
    console.error('🔥 Release failed:', error.message);
    process.exit(1);
  }
})();
