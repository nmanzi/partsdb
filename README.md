# Parts Inventory Management Webapp

A Python webapp for managing inventory of electronic parts, cables, power supplies, and other components stored in numbered bins.

## Features

- **Parts Management**: Add, edit, delete, and search parts with detailed specifications
- **Bin Organization**: Manage storage bins with numbers, names, and locations  
- **Categories**: Organize parts by categories (Power Supplies, Cables, Adapters, etc.)
- **Search & Filter**: Search parts by name, description, specs, or filter by bin/category
- **REST API**: Complete FastAPI backend with OpenAPI documentation
- **Modern UI**: Clean, responsive web interface

## Technology Stack

- **Backend**: FastAPI (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: HTML, CSS, JavaScript
- **API**: RESTful API with automatic documentation

## Setup

1. **Clone or create project directory**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize database with sample data**:
   ```bash
   python init_db.py
   ```

4. **Run the development server**:
   ```bash
   python main.py
   ```

5. **Open in browser**: http://localhost:8000

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
├── backend/
│   ├── database.py     # Database models and setup
│   ├── schemas.py      # Pydantic schemas
│   └── crud.py         # Database operations
├── static/
│   ├── css/
│   │   └── styles.css  # Frontend styling
│   └── js/
│       ├── api.js      # API client
│       └── app.js      # Frontend logic
├── templates/
│   └── index.html      # Main HTML template
├── main.py             # FastAPI application
├── init_db.py          # Database initialization
└── requirements.txt    # Python dependencies
```

## Usage

### Managing Parts
- Click "Add Part" to create new inventory items
- Use search bar to find specific parts
- Filter by bin or category using dropdowns
- Click "Edit" or "Delete" on any part card

### Managing Bins
- Switch to "Bins" view to see all storage containers
- Add bins with numbers, names, and locations
- Each part must be assigned to a bin

### Managing Categories
- Switch to "Categories" view to organize part types
- Create categories like "Power Supplies", "Cables", etc.
- Parts can optionally be assigned to categories

## Development

The app follows FastAPI best practices:
- Async/await support
- Automatic API documentation
- Type hints with Pydantic
- SQLAlchemy ORM with declarative models
- Clean separation of concerns