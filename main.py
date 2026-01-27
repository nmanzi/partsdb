from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session
from typing import List, Optional
import csv
import io
from backend import database, crud

# Initialize FastAPI app
app = FastAPI(title="Parts Inventory Management", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Note: Database tables are created by the entrypoint script

# Dependency
def get_db():
    with Session(database.engine) as session:
        yield session

# Frontend routes
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API Routes - Bins
@app.get("/api/bins", response_model=List[database.BinRead])
def read_bins(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bins = crud.get_bins(db, skip=skip, limit=limit)
    return bins

@app.post("/api/bins", response_model=database.BinRead)
def create_bin(bin: database.BinCreate, db: Session = Depends(get_db)):
    # Check if bin number already exists
    db_bin = crud.get_bin_by_number(db, bin.number)
    if db_bin:
        raise HTTPException(status_code=400, detail="Bin number already exists")
    return crud.create_bin(db=db, bin=bin)

@app.get("/api/bins/{bin_id}", response_model=database.BinWithParts)
def read_bin(bin_id: int, db: Session = Depends(get_db)):
    db_bin = crud.get_bin(db, bin_id=bin_id)
    if db_bin is None:
        raise HTTPException(status_code=404, detail="Bin not found")
    return db_bin

@app.put("/api/bins/{bin_id}", response_model=database.BinRead)
def update_bin(bin_id: int, bin_update: database.BinUpdate, db: Session = Depends(get_db)):
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
@app.get("/api/categories", response_model=List[database.CategoryRead])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.post("/api/categories", response_model=database.CategoryRead)
def create_category(category: database.CategoryCreate, db: Session = Depends(get_db)):
    # Check if category name already exists
    db_category = crud.get_category_by_name(db, category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category name already exists")
    return crud.create_category(db=db, category=category)

@app.get("/api/categories/{category_id}", response_model=database.CategoryWithParts)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.put("/api/categories/{category_id}", response_model=database.CategoryRead)
def update_category(category_id: int, category_update: database.CategoryUpdate, db: Session = Depends(get_db)):
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
@app.get("/api/parts", response_model=List[database.PartRead])
def read_parts(skip: int = 0, limit: int = 100, bin_id: Optional[int] = None, 
               category_id: Optional[int] = None, search: Optional[str] = None, 
               db: Session = Depends(get_db)):
    if search:
        parts = crud.search_parts(db, search_term=search, skip=skip, limit=limit)
    else:
        parts = crud.get_parts(db, skip=skip, limit=limit, bin_id=bin_id, category_id=category_id)
    return parts

@app.post("/api/parts", response_model=database.PartRead)
def create_part(part: database.PartCreate, db: Session = Depends(get_db)):
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

@app.get("/api/parts/{part_id}", response_model=database.PartRead)
def read_part(part_id: int, db: Session = Depends(get_db)):
    db_part = crud.get_part(db, part_id=part_id)
    if db_part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return db_part

@app.put("/api/parts/{part_id}", response_model=database.PartRead)
def update_part(part_id: int, part_update: database.PartUpdate, db: Session = Depends(get_db)):
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

# CSV Import functionality
@app.post("/api/import/csv")
async def import_parts_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Import parts from CSV file. Expected CSV columns:
    name,description,quantity,part_type,specifications,manufacturer,model,bin_number,category_name
    
    bin_number and category_name will be used to find existing bins/categories.
    If they don't exist, they will be created.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        created_parts = []
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 for header row
            try:
                # Get or create bin
                bin_number = int(row.get('bin_number', 0))
                if bin_number <= 0:
                    errors.append(f"Row {row_num}: Invalid bin_number '{row.get('bin_number')}'")
                    continue
                    
                db_bin = crud.get_bin_by_number(db, bin_number)
                if not db_bin:
                    # Create bin with basic info
                    bin_create = database.BinCreate(
                        number=bin_number,
                        name=f"Bin {bin_number}",
                        description=f"Auto-created bin {bin_number}"
                    )
                    db_bin = crud.create_bin(db, bin_create)
                
                # Get or create category (optional)
                category_id = None
                category_name = row.get('category_name', '').strip()
                if category_name:
                    db_category = crud.get_category_by_name(db, category_name)
                    if not db_category:
                        category_create = database.CategoryCreate(
                            name=category_name,
                            description=f"Auto-created category {category_name}"
                        )
                        db_category = crud.create_category(db, category_create)
                    category_id = db_category.id
                
                # Create part
                part_data = database.PartCreate(
                    name=row.get('name', '').strip(),
                    description=row.get('description', '').strip() or None,
                    quantity=int(row.get('quantity', 1)),
                    part_type=row.get('part_type', '').strip() or None,
                    specifications=row.get('specifications', '').strip() or None,
                    manufacturer=row.get('manufacturer', '').strip() or None,
                    model=row.get('model', '').strip() or None,
                    bin_id=db_bin.id,
                    category_id=category_id
                )
                
                if not part_data.name:
                    errors.append(f"Row {row_num}: Part name is required")
                    continue
                
                created_part = crud.create_part(db, part_data)
                created_parts.append(created_part.name)
                
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return {
            "message": f"Import completed. {len(created_parts)} parts created.",
            "created_parts": created_parts,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.get("/api/export/csv")
def export_parts_csv(db: Session = Depends(get_db)):
    """Export all parts to CSV format"""
    from fastapi.responses import StreamingResponse
    
    parts = crud.get_parts(db, limit=10000)  # Get all parts
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'name', 'description', 'quantity', 'part_type', 'specifications', 
        'manufacturer', 'model', 'bin_number', 'category_name'
    ])
    
    # Write data
    for part in parts:
        writer.writerow([
            part.name,
            part.description or '',
            part.quantity,
            part.part_type or '',
            part.specifications or '',
            part.manufacturer or '',
            part.model or '',
            part.bin.number,
            part.category.name if part.category else ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=parts_export.csv"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)