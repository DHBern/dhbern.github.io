#!/bin/bash
set -e

echo "[devcontainer] Installing project dependencies..."

# Node.js packages
npm install

# Python environment via uv
uv sync

# R packages with renv
Rscript -e 'install.packages("renv", repos="https://cloud.r-project.org"); renv::restore()'

echo "[devcontainer] Setup complete."
