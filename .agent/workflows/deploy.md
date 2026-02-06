---
description: how to deploy the Hydrogen Orbital Visualizer to GitHub Pages
---

# Deploying to GitHub Pages

This guide outlines the steps to deploy your application to GitHub Pages.

## Prerequisites
1. Ensure your code is pushed to a GitHub repository.
2. Ensure you have the necessary permissions to push to the `gh-pages` branch.

## Deployment Steps

1. **Build and Deploy via Script**:
   Run the following command in your terminal:
   ```bash
   npm run deploy
   ```
   This command will:
   - Run `npm run build` to generate the production-ready assets in the `dist` folder.
   - Use the `gh-pages` package to push the contents of the `dist` folder to a new `gh-pages` branch on your repository.

2. **Configure GitHub Settings**:
   - Go to your repository on GitHub.
   - Navigate to **Settings > Pages**.
   - Under **Build and deployment > Source**, ensure "Deploy from a branch" is selected.
   - Under **Branch**, select `gh-pages` and `/ (root)`.

3. **Verify Deployment**:
   - GitHub will provide a URL (usually `https://<username>.github.io/<repo-name>/`).
   - Wait a few minutes for the build to complete and visit the URL.

> [!TIP]
> Since we set `base: './'` in `vite.config.ts`, the app will work regardless of whether it's deployed to a subfolder or a custom domain.
