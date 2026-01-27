##
# A basic script template used by Alembic when autogenerating
# migration files. Kept minimal to support simple revisions.
##
from alembic import op
import sqlalchemy as sa

revision = '${rev_id}'
down_revision = ${down_rev!r}
branch_labels = ${branch_labels!r}
depends_on = ${depends_on!r}

def upgrade():
    ${upgrades if upgrades else 'pass'}


def downgrade():
    ${downgrades if downgrades else 'pass'}
