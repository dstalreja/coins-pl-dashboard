"""
Pytest configuration and shared fixtures for all tests.
"""

import pytest
import sys
import os

# Add the backend directory to Python path for imports
backend_path = os.path.join(os.path.dirname(__file__), '..', 'code', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

