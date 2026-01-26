from sqlalchemy.orm import Session
from typing import List, Optional
from . import database, schemas

# Bin CRUD operations
def get_bin(db: Session, bin_id: int):
    return db.query(database.Bin).filter(database.Bin.id == bin_id).first()

def get_bin_by_number(db: Session, bin_number: int):
    return db.query(database.Bin).filter(database.Bin.number == bin_number).first()

def get_bins(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Bin).offset(skip).limit(limit).all()

def create_bin(db: Session, bin: schemas.BinCreate):
    db_bin = database.Bin(**bin.dict())
    db.add(db_bin)
    db.commit()
    db.refresh(db_bin)
    return db_bin

def update_bin(db: Session, bin_id: int, bin_update: schemas.BinUpdate):
    db_bin = get_bin(db, bin_id)
    if db_bin:
        update_data = bin_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_bin, key, value)
        db.commit()
        db.refresh(db_bin)
    return db_bin

def delete_bin(db: Session, bin_id: int):
    db_bin = get_bin(db, bin_id)
    if db_bin:
        db.delete(db_bin)
        db.commit()
    return db_bin

# Category CRUD operations
def get_category(db: Session, category_id: int):
    return db.query(database.Category).filter(database.Category.id == category_id).first()

def get_category_by_name(db: Session, category_name: str):
    return db.query(database.Category).filter(database.Category.name == category_name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = database.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category_update: schemas.CategoryUpdate):
    db_category = get_category(db, category_id)
    if db_category:
        update_data = category_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# Part CRUD operations
def get_part(db: Session, part_id: int):
    return db.query(database.Part).filter(database.Part.id == part_id).first()

def get_parts(db: Session, skip: int = 0, limit: int = 100, bin_id: Optional[int] = None, category_id: Optional[int] = None):
    query = db.query(database.Part)
    if bin_id:
        query = query.filter(database.Part.bin_id == bin_id)
    if category_id:
        query = query.filter(database.Part.category_id == category_id)
    return query.offset(skip).limit(limit).all()

def search_parts(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    if not search_term.strip():
        return []
    
    # Split search term into individual words
    search_words = [word.strip() for word in search_term.split() if word.strip()]
    
    query = db.query(database.Part)
    
    # For each word, ensure it appears in at least one field
    for word in search_words:
        word_pattern = f"%{word}%"
        query = query.filter(
            database.Part.name.ilike(word_pattern) |
            database.Part.description.ilike(word_pattern) |
            database.Part.part_type.ilike(word_pattern) |
            database.Part.specifications.ilike(word_pattern) |
            database.Part.manufacturer.ilike(word_pattern) |
            database.Part.model.ilike(word_pattern)
        )
    
    return query.offset(skip).limit(limit).all()

def create_part(db: Session, part: schemas.PartCreate):
    db_part = database.Part(**part.dict())
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part

def update_part(db: Session, part_id: int, part_update: schemas.PartUpdate):
    db_part = get_part(db, part_id)
    if db_part:
        update_data = part_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_part, key, value)
        db.commit()
        db.refresh(db_part)
    return db_part

def delete_part(db: Session, part_id: int):
    db_part = get_part(db, part_id)
    if db_part:
        db.delete(db_part)
        db.commit()
    return db_part