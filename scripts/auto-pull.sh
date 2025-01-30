#!/bin/bash
while true; do
  git pull https://github.com/Rtist-at-work/Machine-Seller-Frontend main   # Or use your default branch name (e.g., 'master')
  sleep 60               # Wait for 1 minute before checking again
done
