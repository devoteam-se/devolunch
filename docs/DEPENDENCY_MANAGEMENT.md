# Dependency Management with Renovate

This document explains how automated dependency management is set up for the DevoLunch project using Renovate.

## 📋 Overview

Renovate automatically keeps our dependencies up-to-date by:
- 🔍 Scanning for outdated dependencies weekly
- 📝 Creating pull requests with updates
- 🛡️ Running security audits on dependency changes
- 🚀 Auto-merging safe updates (patch/minor dev dependencies)
- 📊 Grouping related updates for easier review

## 🔧 Configuration

### Renovate Configuration (`renovate.json`)

Our Renovate setup includes:

- **Schedule**: Updates run Monday mornings (before 6am CET)
- **Grouping**: Related packages updated together (React, TypeScript, etc.)
- **Auto-merge**: Safe dev dependency updates auto-merge after CI passes
- **Security**: Vulnerability alerts trigger immediate updates
- **Version Constraints**: Node.js ≥22, pnpm ≥10

### Key Features

#### 🏷️ Grouped Updates
- **React ecosystem**: React, React DOM, related types
- **TypeScript & ESLint**: TS compiler and linting tools
- **Vite & Build tools**: Vite, Vitest, Rollup, ESBuild
- **Testing libraries**: Testing Library packages

#### 🔒 Security
- **Vulnerability alerts**: Immediate updates for security issues
- **Dependency review**: GitHub action reviews license and security
- **Audit checks**: pnpm audit runs on all dependency PRs

#### ⚡ Automation
- **Auto-merge**: Patch/minor dev dependencies merge automatically
- **Auto-approve**: Renovate PRs get automatic approval
- **Status checks**: Full CI must pass before merge

## 🚀 Setup Instructions

### 1. Enable Renovate on GitHub

1. Go to [Renovate GitHub App](https://github.com/apps/renovate)
2. Click "Install" or "Configure"
3. Select the repository: `adamoldin/devolunch`
4. Grant necessary permissions

### 2. Repository Settings

Ensure these settings are configured:

- **Branch protection**: `main` branch should require status checks
- **Auto-merge**: Enable for the repository
- **Dependency alerts**: Enable Dependabot security alerts

### 3. Verify Configuration

After setup, Renovate will:
1. Create an onboarding PR explaining the configuration
2. Start scanning for dependency updates
3. Create the first batch of update PRs on the next Monday

## 📊 What to Expect

### Weekly Updates
Every Monday morning, you'll receive PRs for:
- Security vulnerabilities (immediate)
- Outdated dependencies grouped logically
- Lock file maintenance

### Auto-merge Criteria
These updates merge automatically:
- ✅ Patch versions of dev dependencies (`1.2.3` → `1.2.4`)
- ✅ Minor versions of dev dependencies (`1.2.3` → `1.3.0`)
- ✅ All CI checks pass
- ✅ No merge conflicts

### Manual Review Required
These updates need manual approval:
- 🔍 Major version updates (`1.x.x` → `2.x.x`)
- 🔍 Production dependencies (any version)
- 🔍 Updates that fail CI

## 🛠️ Customization

### Modify Update Schedule

Edit `renovate.json`:
```json
{
  "schedule": ["before 6am on Monday"]
}
```

### Change Auto-merge Rules

Adjust the `packageRules` section:
```json
{
  "matchDepTypes": ["devDependencies"],
  "automerge": true,
  "matchUpdateTypes": ["patch", "minor"]
}
```

### Add Package Groups

Create new grouped updates:
```json
{
  "groupName": "Emotion packages",
  "matchPackageNames": [
    "@emotion/react",
    "@emotion/styled"
  ]
}
```

## 🔍 Monitoring

### Check Renovate Dashboard
- Visit: https://developer.mend.io/
- Login with GitHub
- View repository status and logs

### Review Dependency Health
- Monitor security alerts in GitHub Security tab
- Check CI failures on Renovate PRs
- Review major version update PRs carefully

## 🚨 Troubleshooting

### Renovate Not Creating PRs
1. Check repository access in Renovate dashboard
2. Verify `renovate.json` syntax
3. Look for error logs in dashboard

### Auto-merge Not Working
1. Ensure branch protection allows auto-merge
2. Check that all required status checks pass
3. Verify PR has correct labels

### CI Failures
1. Review failed tests in PR
2. Check if dependency introduces breaking changes
3. Update tests or configuration as needed

### Emergency Dependency Updates
For critical security fixes:
1. Create manual PR with updated dependencies
2. Merge immediately after CI passes
3. Renovate will detect and skip in next run

## 📈 Benefits

- 🔒 **Security**: Automatic vulnerability patching
- ⏰ **Time Saving**: No manual dependency checking
- 🧪 **Quality**: All updates tested by CI
- 📈 **Consistency**: Regular, predictable updates
- 🔍 **Visibility**: Clear changelog and update info

## 📝 Notes

- First setup may create many PRs as dependencies catch up
- Consider pausing Renovate during major refactoring
- Review major updates carefully for breaking changes
- Renovate respects semantic versioning for safer updates