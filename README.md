# Zengine Power-Tools • Central Admin Controls Portal

Web-based admin portal and live simulator for configuring the **Zengine Power-Tools & Auto-Tab** browser extension for the George Snow Scholarship Fund.

## Key Features
- **Modern Minimalist Vector Icon Design**: Replaces legacy emojis with sleek, typography-friendly monochrome SVG outlines (or pure text-only layout).
- **Interactive Live Palette Simulator**: Real-time mockup showing how search results, descender line-heights, and icon sets render in Zengine.
- **Keyboard Remapping Matrix**: Real-time hotkey reassignment and enable/disable toggles for all 15 actions.
- **Workspace Drawer Routing**: Directly configures the fast disbursement drawer route (`/workspaces/34919/data/185672?record=185672.add&tab=linked`).
- **Live Zengine API Token Tester**: Instant connectivity check and latency verification.
- **JSON Profile Export & Import**: Transfer settings between machines or browsers with 1 click.

---

## 🚀 Instant Deployment to Vercel

You can deploy this admin page to Vercel in seconds using the Vercel CLI or via GitHub:

### Option 1: Vercel CLI (1-liner)
```bash
# In this directory:
npx vercel
```
Follow the interactive prompts (hit Enter to accept defaults) and your admin controls will be live on `https://your-project.vercel.app`!

For production deployment:
```bash
npx vercel --prod
```

### Option 2: Deploy via GitHub
1. Push this folder to a GitHub repository.
2. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New Project"**.
3. Import the repository. Vercel will automatically detect the static configuration and deploy it instantly.

---

## 💻 Running Locally

To test locally on your machine:
```bash
python server.py
```
Open **http://localhost:3000** in your browser.
