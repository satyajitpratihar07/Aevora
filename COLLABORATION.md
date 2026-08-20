# Collaborating on PulseCloud HMS

This repository contains the PulseCloud Healthcare Management System (HMS) portal. Follow the guide below to collaborate with your team.

## Getting Started

To set up the project locally, run:
```bash
# Clone the repository
git clone https://github.com/satyajitpratihar07/Aevora.git

# Install dependencies
npm install

# Run the local development server
npm run dev
```

---

## Daily Git Workflow

Follow this loop to keep your code synchronized and avoid conflicts.

### 1. Get Latest Code (Pull)
Always run this before starting your work session:
```bash
git pull origin main
```

### 2. Make Changes
Edit the code, add new features, or update documentation files.

### 3. Stage and Commit Changes
Verify your changes and package them into a commit:
```bash
# Check modified files
git status

# Stage files (e.g. documentation markdown)
git add README.md

# Commit
git commit -m "Update project instructions in README.md"
```

### 4. Upload Changes (Push)
Push your commits up to the remote repository on GitHub:
```bash
git push origin main
```
