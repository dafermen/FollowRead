"""Persist voice selection for resumable queued processing."""

import sqlalchemy as sa
from alembic import op

revision = "20260912_0004"
down_revision = "20260729_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("processing_jobs", sa.Column("voice_id", sa.String(120), nullable=True))


def downgrade() -> None:
    op.drop_column("processing_jobs", "voice_id")
