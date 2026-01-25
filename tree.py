# tree.py
from pathlib import Path

IGNORED_DIRS = {".git", ".venv", "__pycache__", ".idea", ".mypy_cache", ".pytest_cache"}
IGNORED_FILES_SUFFIXES = {".pyc", ".pyo"}
IGNORED_FILE_EXT = {".db", ".sqlite", ".sqlite3"}


def is_ignored_dir(path: Path) -> bool:
    return path.name in IGNORED_DIRS


def is_ignored_file(path: Path) -> bool:
    if path.suffix in IGNORED_FILES_SUFFIXES:
        return True
    if path.suffix in IGNORED_FILE_EXT:
        return True
    return False


def print_tree(root: Path, prefix: str = "") -> None:
    # Получаем список видимых файлов/папок
    entries = [p for p in root.iterdir() if not is_ignored_dir(p) and not is_ignored_file(p)]
    # Сортируем: сначала директории, затем файлы
    entries.sort(key=lambda p: (p.is_file(), p.name.lower()))

    for index, path in enumerate(entries):
        connector = "└── " if index == len(entries) - 1 else "├── "
        print(prefix + connector + path.name)

        if path.is_dir():
            extension = "    " if index == len(entries) - 1 else "│   "
            print_tree(path, prefix + extension)


def main() -> None:
    root = Path(__file__).resolve().parent
    print(f"{root.name}/")
    print_tree(root)


if __name__ == "__main__":
    main()
