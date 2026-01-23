"""
Code Runner module (Phase-1).

This module intentionally implements a minimal Python execution backend:
- Static AST validation (security gate #1)
- Local subprocess execution with a strict timeout

It is designed to be replaceable by a Docker sandbox in later phases.
"""

