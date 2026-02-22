from sqlmodel import Session, select
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from . import database

# Helper function to get parts by category IDs
def get_parts_by_categories(db: Session, category_ids: List[int], skip: int = 0, limit: int = 100) -> List[database.Part]:
    """Get parts that belong to any of the specified categories"""
    statement = select(database.Part).join(database.PartCategoryLink).where(
        database.PartCategoryLink.category_id.in_(category_ids)
    ).offset(skip).limit(limit)
    return db.exec(statement).all()

# Bin CRUD operations
def get_bin(db: Session, bin_id: int) -> Optional[database.Bin]:
    return db.get(database.Bin, bin_id)

def get_bin_by_number(db: Session, bin_number: int) -> Optional[database.Bin]:
    statement = select(database.Bin).where(database.Bin.number == bin_number)
    return db.exec(statement).first()

def get_bins(db: Session, skip: int = 0, limit: int = 100) -> List[database.BinReadWithCount]:
    statement = (
        select(database.Bin, func.count(database.Part.id).label("part_count"))
        .outerjoin(database.Part, database.Part.bin_id == database.Bin.id)
        .group_by(database.Bin.id)
        .order_by(database.Bin.number)
        .offset(skip)
        .limit(limit)
    )
    rows = db.exec(statement).all()
    return [
        database.BinReadWithCount(
            id=b.id,
            number=b.number,
            size=b.size,
            location=b.location,
            created_at=b.created_at,
            part_count=count,
        )
        for b, count in rows
    ]

def create_bin(db: Session, bin: database.BinCreate) -> database.Bin:
    db_bin = database.Bin.model_validate(bin)
    db.add(db_bin)
    db.commit()
    db.refresh(db_bin)
    return db_bin

def update_bin(db: Session, bin_id: int, bin_update: database.BinUpdate) -> Optional[database.Bin]:
    db_bin = get_bin(db, bin_id)
    if db_bin:
        update_data = bin_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_bin, key, value)
        db.commit()
        db.refresh(db_bin)
    return db_bin

def delete_bin(db: Session, bin_id: int) -> Optional[database.Bin]:
    db_bin = get_bin(db, bin_id)
    if db_bin:
        db.delete(db_bin)
        db.commit()
    return db_bin

# Category CRUD operations
def get_category(db: Session, category_id: int) -> Optional[database.Category]:
    return db.get(database.Category, category_id)

def get_category_by_name(db: Session, category_name: str) -> Optional[database.Category]:
    statement = select(database.Category).where(database.Category.name == category_name)
    return db.exec(statement).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[database.Category]:
    statement = select(database.Category).offset(skip).limit(limit).order_by(database.Category.name)
    return db.exec(statement).all()

def create_category(db: Session, category: database.CategoryCreate) -> database.Category:
    db_category = database.Category.model_validate(category)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category_update: database.CategoryUpdate) -> Optional[database.Category]:
    db_category = get_category(db, category_id)
    if db_category:
        update_data = category_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> Optional[database.Category]:
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# Part CRUD operations
def get_part(db: Session, part_id: int) -> Optional[database.Part]:
    return db.get(database.Part, part_id)

def get_parts(db: Session, skip: int = 0, limit: int = 100, bin_id: Optional[int] = None, category_ids: Optional[List[int]] = None) -> List[database.Part]:
    statement = select(database.Part)
    if bin_id:
        statement = statement.where(database.Part.bin_id == bin_id)
    if category_ids:
        # Join with the junction table to filter by category IDs and ensure no duplicates
        statement = statement.join(database.PartCategoryLink).where(
            database.PartCategoryLink.category_id.in_(category_ids)
        ).distinct()
    statement = statement.offset(skip).limit(limit)
    return db.exec(statement).all()

def search_parts(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[database.Part]:
    if not search_term.strip():
        return []
    
    # Split search term into individual words
    search_words = [word.strip() for word in search_term.split() if word.strip()]
    
    statement = select(database.Part)
    
    # For each word, ensure it appears in at least one field
    for word in search_words:
        word_pattern = f"%{word}%"
        statement = statement.where(
            database.Part.name.ilike(word_pattern) |
            database.Part.part_type.ilike(word_pattern) |
            database.Part.specifications.ilike(word_pattern) |
            database.Part.manufacturer.ilike(word_pattern) |
            database.Part.model.ilike(word_pattern)
        )
    
    statement = statement.offset(skip).limit(limit)
    return db.exec(statement).all()

def create_part(db: Session, part: database.PartCreate) -> database.Part:
    # Extract category_ids from the part data
    category_ids = part.category_ids if hasattr(part, 'category_ids') else []
    
    # Create part without category_ids (since it's not in the actual table)
    part_data = part.model_dump(exclude={'category_ids'})
    db_part = database.Part.model_validate(part_data)
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    
    # Add category relationships
    if category_ids:
        for category_id in category_ids:
            category = get_category(db, category_id)
            if category:
                db_part.categories.append(category)
        db.commit()
        db.refresh(db_part)
    
    return db_part

def update_part(db: Session, part_id: int, part_update: database.PartUpdate) -> Optional[database.Part]:
    db_part = get_part(db, part_id)
    if db_part:
        # Extract category_ids if present
        category_ids = getattr(part_update, 'category_ids', None)
        
        # Update regular fields
        update_data = part_update.model_dump(exclude_unset=True, exclude={'category_ids'})
        for key, value in update_data.items():
            setattr(db_part, key, value)
        
        # Update categories if provided
        if category_ids is not None:
            # Clear existing categories
            db_part.categories.clear()
            # Add new categories
            for category_id in category_ids:
                category = get_category(db, category_id)
                if category:
                    db_part.categories.append(category)
        
        # Manually update the updated_at timestamp
        db_part.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_part)
    return db_part

def delete_part(db: Session, part_id: int) -> Optional[database.Part]:
    db_part = get_part(db, part_id)
    if db_part:
        db.delete(db_part)
        db.commit()
    return db_part