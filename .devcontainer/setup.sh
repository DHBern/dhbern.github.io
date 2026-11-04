#!/bin/bash
set -e

echo "[devcontainer] Installing project dependencies..."

# Node.js packages
npm install

# Python environment via uv
uv sync --managed-python
uv run --managed-python python -c 'import shutil, tempfile, urllib.request, yaml'

# R packages with renv
Rscript -e 'install.packages("renv", repos="https://cloud.r-project.org"); renv::restore()'
touch renv/restore.complete

echo "[devcontainer] Setup complete."
