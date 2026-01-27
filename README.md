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

### CSV Import/Export
The application supports bulk import and export of parts data via CSV files, both through the web UI and REST API.

#### Using the Web Interface
- **Import CSV**: Click the "Import CSV" button in the toolbar to select and upload a CSV file
- **Export CSV**: Click the "Export CSV" button to download all current parts data as a CSV file
- **Validation**: Import errors are displayed with specific line numbers and descriptions
- **Progress**: Loading indicators show import/export progress

#### Importing Parts from CSV
The web interface provides an easy way to import parts, or you can use the `/api/import/csv` endpoint directly:

**Expected CSV Format:**
```csv
name,description,quantity,part_type,specifications,manufacturer,model,bin_number,category_name
Dell Power Supply,19.5V laptop adapter,2,Power Supply,19.5V 2.31A,Dell,,3,Power Supplies
HDMI Cable,Standard HDMI cable,5,Cable,1.5m length,,,1,Cables
Arduino Nano,Microcontroller board,10,Electronics,ATmega328P,Arduino,Nano,2,Electronics
USB-C Cable,USB-A to USB-C cable,3,Cable,1.2m length,,,1,Cables
Raspberry Pi 4,Single board computer,1,Electronics,4GB RAM Model B,Raspberry Pi Foundation,4B,2,Electronics
```

**CSV Column Descriptions:**
- `name` (required): Part name/title
- `description` (optional): Detailed description
- `quantity` (optional): Number of items (defaults to 1)
- `part_type` (optional): Type of part (Cable, Power Supply, etc.)
- `specifications` (optional): Technical specifications
- `manufacturer` (optional): Manufacturer name
- `model` (optional): Model number/identifier
- `bin_number` (required): Bin number where part is stored
- `category_name` (optional): Category name for organization

**Import Features:**
- **Auto-creation**: Bins and categories are automatically created if they don't exist
- **Validation**: Row-by-row error reporting with line numbers
- **Flexible**: Only name and bin_number are required fields
- **Safe**: Import errors don't affect valid rows

#### Exporting Parts to CSV
The web interface provides a one-click export, or you can use the `/api/export/csv` endpoint to download all parts data in CSV format. The export uses the same column structure as import, making it easy to:
- Backup your inventory data
- Share part lists with others
- Prepare import templates
- Migrate data between instances

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