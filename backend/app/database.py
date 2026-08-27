from sqlalchemy import BigInteger, create_engine
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


@compiles(BigInteger, "sqlite")
def _bigint_as_integer_on_sqlite(type_, compiler, **kw):
    # SQLite only auto-increments a primary key declared as exactly INTEGER
    # PRIMARY KEY (its rowid alias) - BIGINT doesn't qualify, so a BigInteger
    # PK (readings.id) would need an explicit id on every insert otherwise.
    # Postgres is unaffected: this only overrides SQLite's DDL compilation,
    # and production still gets a real BIGINT/BIGSERIAL column there.
    return "INTEGER"
