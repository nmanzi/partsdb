<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Parts Inventory Management Webapp

This is a Python webapp for managing inventory of electronic parts, cables, power supplies, and other components stored in numbered bins.

## Project Structure
- FastAPI backend with REST API
- SQLite database with SQLAlchemy ORM
- Modern frontend UI (HTML/CSS/JavaScript)
- Features: CRUD operations, search, bin management, categories

## Development Guidelines
- Use Python 3.8+ with FastAPI framework
- Follow REST API best practices
- Use SQLAlchemy for database operations
- Keep frontend simple and responsive
- Follow PEP 8 coding standards

## Setup Instructions
1. Activate virtual environment: `source .venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Initialize database: `python init_db.py`
4. Run server: `python main.py`
5. Access webapp: http://localhost:8000

## API Documentation
Visit http://localhost:8000/docs for interactive API documentation when server is running.