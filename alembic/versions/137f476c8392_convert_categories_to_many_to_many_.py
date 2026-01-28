# A basic script template used by Alembic when autogenerating
# migration files. Kept minimal to support simple revisions.
"""convert categories to many-to-many relationship

Revision ID: 137f476c8392
Revises: f586964f213f
Create Date: 2026-01-28 22:25:04.888406

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '137f476c8392'
down_revision: Union[str, None] = 'f586964f213f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the junction table for many-to-many relationship
    op.create_table('part_categories',
    sa.Column('part_id', sa.Integer(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
    sa.ForeignKeyConstraint(['part_id'], ['parts.id'], ),
    sa.PrimaryKeyConstraint('part_id', 'category_id')
    )
    
    # Migrate existing data from parts.category_id to junction table
    connection = op.get_bind()
    
    # Get all parts with category_id set
    result = connection.execute(sa.text("SELECT id, category_id FROM parts WHERE category_id IS NOT NULL"))
    parts_with_categories = result.fetchall()
    
    # Insert into junction table
    for part_id, category_id in parts_with_categories:
        connection.execute(
            sa.text("INSERT INTO part_categories (part_id, category_id) VALUES (:part_id, :category_id)"),
            {"part_id": part_id, "category_id": category_id}
        )
    
    # For SQLite, we need to recreate the table without the category_id column
    # This is a workaround for SQLite's limited ALTER TABLE support
    
    # Step 1: Create new table without category_id
    op.execute("""
        CREATE TABLE parts_new (
            name VARCHAR(200) NOT NULL,
            description VARCHAR,
            quantity INTEGER NOT NULL,
            part_type VARCHAR(100),
            specifications VARCHAR,
            manufacturer VARCHAR(100),
            model VARCHAR(100),
            bin_id INTEGER NOT NULL,
            id INTEGER NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY(bin_id) REFERENCES bins (id)
        )
    """)
    
    # Step 2: Copy data (excluding category_id)
    op.execute("""
        INSERT INTO parts_new (name, description, quantity, part_type, specifications, 
                              manufacturer, model, bin_id, id, created_at, updated_at)
        SELECT name, description, quantity, part_type, specifications, 
               manufacturer, model, bin_id, id, created_at, updated_at
        FROM parts
    """)
    
    # Step 3: Drop old table and rename new one
    op.execute("DROP TABLE parts")
    op.execute("ALTER TABLE parts_new RENAME TO parts")
    
    # Step 4: Recreate indexes
    op.create_index(op.f('ix_parts_name'), 'parts', ['name'], unique=False)


def downgrade() -> None:
    # For downgrade, we need to recreate the parts table with category_id
    
    # Step 1: Create new table with category_id
    op.execute("""
        CREATE TABLE parts_new (
            name VARCHAR(200) NOT NULL,
            description VARCHAR,
            quantity INTEGER NOT NULL,
            part_type VARCHAR(100),
            specifications VARCHAR,
            manufacturer VARCHAR(100),
            model VARCHAR(100),
            bin_id INTEGER NOT NULL,
            category_id INTEGER,
            id INTEGER NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY(bin_id) REFERENCES bins (id),
            FOREIGN KEY(category_id) REFERENCES categories (id)
        )
    """)
    
    # Step 2: Copy data
    op.execute("""
        INSERT INTO parts_new (name, description, quantity, part_type, specifications, 
                              manufacturer, model, bin_id, id, created_at, updated_at)
        SELECT name, description, quantity, part_type, specifications, 
               manufacturer, model, bin_id, id, created_at, updated_at
        FROM parts
    """)
    
    # Step 3: Migrate data back from junction table (taking first category for each part)
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT part_id, MIN(category_id) as category_id FROM part_categories GROUP BY part_id"))
    part_categories = result.fetchall()
    
    # Update parts table with first category
    for part_id, category_id in part_categories:
        connection.execute(
            sa.text("UPDATE parts_new SET category_id = :category_id WHERE id = :part_id"),
            {"category_id": category_id, "part_id": part_id}
        )
    
    # Step 4: Drop old table and rename new one
    op.execute("DROP TABLE parts")
    op.execute("ALTER TABLE parts_new RENAME TO parts")
    
    # Step 5: Recreate indexes
    op.create_index(op.f('ix_parts_name'), 'parts', ['name'], unique=False)
    
    # Step 6: Drop the junction table
    op.drop_table('part_categories')
