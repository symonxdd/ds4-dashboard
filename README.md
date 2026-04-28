## 🚀 Release Workflow
DS4 Dashboard uses an automated release pipeline powered by **GitHub Actions** and a helper script.

To create a new release, I run the release script:
```bash
npm run release
```

This will:
1. Prompt to select the version type (`Patch`, `Minor`, or `Major`)
2. Bump the version in `package.json` & `src-tauri/tauri.conf.json`
3. Commit the changes and create a Git tag
4. Push the commit and tag to GitHub

> [!NOTE]
> The version bump uses a clear commit message like: `chore: bump version to v1.2.3`

When a `v*` tag is pushed, the [`release.yml`](.github/workflows/release.yml) GitHub Actions workflow is triggered.

- 🔧 Builds the production app (Windows).
- 📦 Packages it into an installer (`.msi` / `.exe`).
- 📝 Creates a new GitHub Release and uploads the artifacts.

💡 The release process can be viewed under the repo's **Actions** tab.
