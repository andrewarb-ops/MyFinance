"""add card_number to accounts

Revision ID: 864daeea00b5
Revises: a26138cee6f3
Create Date: 2026-01-25 11:28:29.727745

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '864daeea00b5'
down_revision: Union[str, Sequence[str], None] = 'a26138cee6f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column(
        "accounts",
        sa.Column("card_number", sa.String(length=32), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("accounts", "card_number")