#!/usr/bin/env python
import os
from pathlib import Path

IGNORE_DIRS = {
    ".git",
    "__pycache__",
    ".idea",
    ".vscode",
    "node_modules",
    ".venv",
    "venv",
    ".mypy_cache",
    ".pytest_cache",
}

IGNORE_FILES = {
    ".DS_Store",
}

def print_tree(root: Path, prefix: str = "") -> None:
    entries = [
        p for p in sorted(root.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        if p.name not in IGNORE_FILES and p.name not in IGNORE_DIRS
    ]

    for i, path in enumerate(entries):
        is_last = i == len(entries) - 1
        connector = "└── " if is_last else "├── "
        print(prefix + connector + path.name)

        if path.is_dir():
            extension = "    " if is_last else "│   "
            print_tree(path, prefix + extension)


def main() -> None:
    root = Path(__file__).resolve().parent
    # если хочешь всегда выводить именно папку MyFinance,
    # можно заменить на root / "MyFinance"
    print(root.name + "/")
    print_tree(root)


if __name__ == "__main__":
    main()
