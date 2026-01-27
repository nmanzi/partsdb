<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Parts Inventory Management Webapp

This is a Python webapp for managing inventory of electronic parts, cables, power supplies, and other components stored in numbered bins.

## Project Structure
- FastAPI backend with REST API
- SQLite database with SQLModel (unified SQLAlchemy + Pydantic models)
- Modern frontend UI (HTML/CSS/JavaScript)
- Features: CRUD operations, search, bin management, categories, CSV import/export
- Docker containerized with automatic migrations

## Development Guidelines
- Use Python 3.8+ with FastAPI framework
- Follow REST API best practices
- Use SQLModel for unified database models and API schemas
- Use Alembic for database migrations (automatic in Docker)
- Keep frontend simple and responsive
- Follow PEP 8 coding standards
- Use CSV import/export for bulk data operations

## Technology Stack
- **Backend**: FastAPI with SQLModel
- **Database**: SQLite with automatic schema migrations
- **Frontend**: Vanilla HTML/CSS/JavaScript with CSV functionality
- **Deployment**: Docker with automatic database setup

## Setup Instructions

### Docker (Recommended)
1. Build and run: `docker-compose up --build`
2. Access webapp: http://localhost:8000
3. Import parts via CSV using the web UI

### Local Development
1. Activate virtual environment: `source .venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `alembic upgrade head`
4. Run server: `python main.py`
5. Access webapp: http://localhost:8000

## Key Features
- **Automatic migrations**: Database schema updates automatically on startup
- **CSV import/export**: Bulk import parts data via web UI or API
- **Auto-creation**: Bins and categories created automatically during CSV import
- **Modern architecture**: SQLModel eliminates duplicate model definitions

## Database Management
- SQLModel provides unified models for both database and API
- Alembic handles schema migrations automatically
- No manual database initialization required
- CSV import handles data population

## API Documentation
Visit http://localhost:8000/docs for interactive API documentation when server is running.