from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Base schemas
class BinBase(BaseModel):
    number: int
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class BinCreate(BinBase):
    pass

class BinUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class Bin(BinBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Part schemas
class PartBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: int = 1
    part_type: Optional[str] = None
    specifications: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    bin_id: int
    category_id: Optional[int] = None

class PartCreate(PartBase):
    pass

class PartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    part_type: Optional[str] = None
    specifications: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    bin_id: Optional[int] = None
    category_id: Optional[int] = None

class Part(PartBase):
    id: int
    created_at: datetime
    updated_at: datetime
    bin: Bin
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True

# Response schemas
class BinWithParts(Bin):
    parts: List[Part] = []

class CategoryWithParts(Category):
    parts: List[Part] = []