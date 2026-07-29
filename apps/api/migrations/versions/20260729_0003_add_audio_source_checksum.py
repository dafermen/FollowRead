"""add persistent audio source checksum

Revision ID: 20260729_0003
Revises: 20260725_0002
Create Date: 2026-07-29
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260729_0003"
down_revision: str | None = "20260725_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "audio_assets",
        sa.Column("source_checksum", sa.String(length=71), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("audio_assets", "source_checksum")
