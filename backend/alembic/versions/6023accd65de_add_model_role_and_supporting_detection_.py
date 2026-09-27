"""add_model_role_and_supporting_detection_ids

Revision ID: 6023accd65de
Revises: c2ebbd6fd26f
Create Date: 2026-09-27 19:28:39.724830

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6023accd65de'
down_revision: Union[str, Sequence[str], None] = 'c2ebbd6fd26f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('detections', sa.Column('model_role', sa.String(length=50), nullable=True))
    op.add_column('detected_regions', sa.Column('supporting_detection_ids', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('detected_regions', 'supporting_detection_ids')
    op.drop_column('detections', 'model_role')
