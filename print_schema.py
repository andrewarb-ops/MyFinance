from sqlalchemy import inspect

from db.base import engine


def print_schema() -> None:
    inspector = inspect(engine)

    for table_name in inspector.get_table_names():
        print(f"TABLE {table_name}")
        columns = inspector.get_columns(table_name)
        for col in columns:
            name = col["name"]
            col_type = col["type"]
            nullable = col.get("nullable", True)
            default = col.get("default")
            print(f"  COLUMN {name:15} {col_type!s:15} "
                  f"nullable={nullable} default={default}")
        print()

if __name__ == "__main__":
    print_schema()
