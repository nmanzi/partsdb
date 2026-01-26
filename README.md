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

### Option 1: Pre-built Docker Image (GHCR)

1. **Pull and run from GitHub Container Registry**:
   ```bash
   docker run -p 8000:8000 -v $(pwd)/data:/app/data ghcr.io/nmanzi/partsdb:latest
   ```

2. **Using Docker Compose with pre-built image**:
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     parts-inventory:
       image: ghcr.io/nmanzi/partsdb:latest
       ports:
         - "8000:8000"
       volumes:
         - ./data:/app/data
       restart: unless-stopped
   ```

### Option 2: Local Development

1. **Create virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # or .venv\Scripts\activate  # Windows
   ```

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
├── data/              # Database storage (SQLite file)
├── main.py            # FastAPI application
├── init_db.py         # Database initialization
├── requirements.txt   # Python dependencies
├── Dockerfile         # Docker container config
├── docker-compose.yml # Docker orchestration
└── .dockerignore      # Docker build exclusions
```

## Docker Deployment

### Configuration Files

- **Dockerfile**: Multi-stage build with security best practices
  - Uses Python 3.11-slim base image
  - Non-root user execution
  - Automatic database initialization
  - Health checks included

- **docker-compose.yml**: Easy container orchestration
  - Port mapping (8000:8000)
  - Volume persistence for database
  - Automatic restart on failure
  - Environment variable configuration

### Container Features

- **Persistent Storage**: Database stored in mounted `./data` volume
- **Automatic Initialization**: If no database exists, sample data is loaded on first run
- **Volume-Safe**: When mounting volumes, existing databases are preserved
- **Security**: Runs as non-root user
- **Monitoring**: Health checks every 30 seconds
- **Production Ready**: Proper logging and error handling
- **Lightweight**: Minimal base image with only required dependencies

### Database Initialization

The container automatically handles database initialization:

- **First Run (no volume)**: Creates database with sample parts data
- **First Run (empty volume)**: Creates database with sample parts data in mounted volume
- **Subsequent Runs**: Uses existing database, preserves all your data
- **Volume Mount**: `./data:/app/data` ensures data persists across container restarts

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

### Local Development
The app follows FastAPI best practices:
- Async/await support
- Automatic API documentation
- Type hints with Pydantic
- SQLAlchemy ORM with declarative models
- Clean separation of concerns

### Docker Development
```bash
# Build and run for development
docker-compose up --build

# View logs
docker-compose logs -f parts-inventory

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up --build -d
```

### Database Management
- **Local**: SQLite database in `./data/parts_inventory.db`
- **Docker**: Mounted volume ensures persistence across container restarts
- **Initialization**: Automatic setup with sample data from your existing inventory