"""add_manual_region_fields_and_provenance

Revision ID: c2ebbd6fd26f
Revises: 965cdfebf75a
Create Date: 2026-09-27 14:20:53.053935

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2ebbd6fd26f'
down_revision: Union[str, Sequence[str], None] = '965cdfebf75a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('detected_regions', 'detection_id', existing_type=sa.Integer(), nullable=True)
    op.add_column('detected_regions', sa.Column('source', sa.String(length=50), nullable=False, server_default='yolo'))
    op.add_column('detected_regions', sa.Column('x1', sa.Float(), nullable=True))
    op.add_column('detected_regions', sa.Column('y1', sa.Float(), nullable=True))
    op.add_column('detected_regions', sa.Column('x2', sa.Float(), nullable=True))
    op.add_column('detected_regions', sa.Column('y2', sa.Float(), nullable=True))
    op.add_column('detected_regions', sa.Column('image_width', sa.Integer(), nullable=True))
    op.add_column('detected_regions', sa.Column('image_height', sa.Integer(), nullable=True))
    op.add_column('extracted_fields', sa.Column('source_region_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_extracted_fields_detected_region', 'extracted_fields', 'detected_regions', ['source_region_id'], ['id'])
    op.create_index(op.f('ix_extracted_fields_source_region_id'), 'extracted_fields', ['source_region_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_extracted_fields_source_region_id'), table_name='extracted_fields')
    op.drop_constraint('fk_extracted_fields_detected_region', 'extracted_fields', type_='foreignkey')
    op.drop_column('extracted_fields', 'source_region_id')
    op.drop_column('detected_regions', 'image_height')
    op.drop_column('detected_regions', 'image_width')
    op.drop_column('detected_regions', 'y2')
    op.drop_column('detected_regions', 'x2')
    op.drop_column('detected_regions', 'y1')
    op.drop_column('detected_regions', 'x1')
    op.drop_column('detected_regions', 'source')
    op.alter_column('detected_regions', 'detection_id', existing_type=sa.Integer(), nullable=False)
