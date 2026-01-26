from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from backend import database, schemas, crud

# Initialize FastAPI app
app = FastAPI(title="Parts Inventory Management", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Note: Database tables are created by the entrypoint script

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Frontend routes
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API Routes - Bins
@app.get("/api/bins", response_model=List[schemas.Bin])
def read_bins(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bins = crud.get_bins(db, skip=skip, limit=limit)
    return bins

@app.post("/api/bins", response_model=schemas.Bin)
def create_bin(bin: schemas.BinCreate, db: Session = Depends(get_db)):
    # Check if bin number already exists
    db_bin = crud.get_bin_by_number(db, bin.number)
    if db_bin:
        raise HTTPException(status_code=400, detail="Bin number already exists")
    return crud.create_bin(db=db, bin=bin)

@app.get("/api/bins/{bin_id}", response_model=schemas.BinWithParts)
def read_bin(bin_id: int, db: Session = Depends(get_db)):
    db_bin = crud.get_bin(db, bin_id=bin_id)
    if db_bin is None:
        raise HTTPException(status_code=404, detail="Bin not found")
    return db_bin

@app.put("/api/bins/{bin_id}", response_model=schemas.Bin)
def update_bin(bin_id: int, bin_update: schemas.BinUpdate, db: Session = Depends(get_db)):
    db_bin = crud.update_bin(db, bin_id=bin_id, bin_update=bin_update)
    if db_bin is None:
        raise HTTPException(status_code=404, detail="Bin not found")
    return db_bin

@app.delete("/api/bins/{bin_id}")
def delete_bin(bin_id: int, db: Session = Depends(get_db)):
    db_bin = crud.delete_bin(db, bin_id=bin_id)
    if db_bin is None:
        raise HTTPException(status_code=404, detail="Bin not found")
    return {"message": "Bin deleted successfully"}

# API Routes - Categories
@app.get("/api/categories", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.post("/api/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    # Check if category name already exists
    db_category = crud.get_category_by_name(db, category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category name already exists")
    return crud.create_category(db=db, category=category)

@app.get("/api/categories/{category_id}", response_model=schemas.CategoryWithParts)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.put("/api/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category_update: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db, category_id=category_id, category_update=category_update)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.delete_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# API Routes - Parts
@app.get("/api/parts", response_model=List[schemas.Part])
def read_parts(skip: int = 0, limit: int = 100, bin_id: Optional[int] = None, 
               category_id: Optional[int] = None, search: Optional[str] = None, 
               db: Session = Depends(get_db)):
    if search:
        parts = crud.search_parts(db, search_term=search, skip=skip, limit=limit)
    else:
        parts = crud.get_parts(db, skip=skip, limit=limit, bin_id=bin_id, category_id=category_id)
    return parts

@app.post("/api/parts", response_model=schemas.Part)
def create_part(part: schemas.PartCreate, db: Session = Depends(get_db)):
    # Verify bin exists
    db_bin = crud.get_bin(db, part.bin_id)
    if not db_bin:
        raise HTTPException(status_code=400, detail="Bin not found")
    
    # Verify category exists if provided
    if part.category_id:
        db_category = crud.get_category(db, part.category_id)
        if not db_category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    return crud.create_part(db=db, part=part)

@app.get("/api/parts/{part_id}", response_model=schemas.Part)
def read_part(part_id: int, db: Session = Depends(get_db)):
    db_part = crud.get_part(db, part_id=part_id)
    if db_part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return db_part

@app.put("/api/parts/{part_id}", response_model=schemas.Part)
def update_part(part_id: int, part_update: schemas.PartUpdate, db: Session = Depends(get_db)):
    # Verify bin exists if provided
    if part_update.bin_id:
        db_bin = crud.get_bin(db, part_update.bin_id)
        if not db_bin:
            raise HTTPException(status_code=400, detail="Bin not found")
    
    # Verify category exists if provided
    if part_update.category_id:
        db_category = crud.get_category(db, part_update.category_id)
        if not db_category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    db_part = crud.update_part(db, part_id=part_id, part_update=part_update)
    if db_part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return db_part

@app.delete("/api/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    db_part = crud.delete_part(db, part_id=part_id)
    if db_part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return {"message": "Part deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)