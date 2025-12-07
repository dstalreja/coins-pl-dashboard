#!/bin/bash
# Simple script to run all tests

echo "Running COINS Trading Dashboard Tests..."
echo "========================================"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "pytest is not installed. Installing test dependencies..."
    pip install -r tests/requirements.txt
fi

# Run tests with verbose output
pytest tests/ -v

echo ""
echo "========================================"
echo "Tests completed!"

