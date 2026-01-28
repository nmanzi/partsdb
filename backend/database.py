from sqlmodel import SQLModel, Field, Relationship, create_engine, Session
from typing import Optional, List
from datetime import datetime, timezone
import os

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

DATABASE_URL = "sqlite:///./data/parts_inventory.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Junction table for many-to-many relationship between Parts and Categories
class PartCategoryLink(SQLModel, table=True):
    __tablename__ = "part_categories"
    
    part_id: int = Field(foreign_key="parts.id", primary_key=True)
    category_id: int = Field(foreign_key="categories.id", primary_key=True)

# SQLModel models that work both as database models and API schemas
class BinBase(SQLModel):
    number: int = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None, max_length=200)

class Bin(BinBase, table=True):
    __tablename__ = "bins"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationship to parts
    parts: List["Part"] = Relationship(back_populates="bin")

class BinCreate(BinBase):
    pass

class BinUpdate(SQLModel):
    description: Optional[str] = None
    location: Optional[str] = None

class BinRead(BinBase):
    id: int
    created_at: datetime

class CategoryBase(SQLModel):
    name: str = Field(max_length=100, unique=True, index=True)
    description: Optional[str] = Field(default=None)

class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Many-to-many relationship with parts
    parts: List["Part"] = Relationship(back_populates="categories", link_model=PartCategoryLink)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

class PartBase(SQLModel):
    name: str = Field(max_length=200, index=True)
    description: Optional[str] = Field(default=None)
    quantity: int = Field(default=1)
    part_type: Optional[str] = Field(default=None, max_length=100)
    specifications: Optional[str] = Field(default=None)
    manufacturer: Optional[str] = Field(default=None, max_length=100)
    model: Optional[str] = Field(default=None, max_length=100)
    bin_id: int = Field(foreign_key="bins.id")

class Part(PartBase, table=True):
    __tablename__ = "parts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    bin: Bin = Relationship(back_populates="parts")
    categories: List[Category] = Relationship(back_populates="parts", link_model=PartCategoryLink)

class PartCreate(PartBase):
    category_ids: Optional[List[int]] = Field(default_factory=list)

class PartUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    part_type: Optional[str] = None
    specifications: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    bin_id: Optional[int] = None
    category_ids: Optional[List[int]] = None

class PartRead(PartBase):
    id: int
    created_at: datetime
    updated_at: datetime
    bin: BinRead
    categories: List[CategoryRead] = []

# Response schemas with relationships
class BinWithParts(BinRead):
    parts: List[PartRead] = []

class CategoryWithParts(CategoryRead):
    parts: List[PartRead] = []

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

# Note: updated_at field needs to be handled in the CRUD operations
# SQLModel doesn't have automatic onupdate like SQLAlchemy's Column