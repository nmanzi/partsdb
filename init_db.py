"""
Script to initialize the database with sample data from StarterParts.md
"""
from backend.database import SessionLocal, create_tables
from backend import crud, schemas

def init_database():
    """Initialize database with existing parts data"""
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Create categories
        categories_data = [
            {"name": "Power Supplies", "description": "DC power supplies, AC adapters, and chargers"},
            {"name": "Cables", "description": "Various cables and connectors"},
            {"name": "Adapters", "description": "Video adapters, converters, and dongles"},
            {"name": "Electronics", "description": "Electronic components and devices"},
            {"name": "3D Printing", "description": "3D printing accessories and supplies"},
        ]
        
        categories = {}
        for cat_data in categories_data:
            if not crud.get_category_by_name(db, cat_data["name"]):
                category = crud.create_category(db, schemas.CategoryCreate(**cat_data))
                categories[cat_data["name"]] = category
                print(f"Created category: {category.name}")
        
        # Refresh categories dict
        for cat in crud.get_categories(db):
            categories[cat.name] = cat
        
        # Create bins
        bins_data = [
            {"number": 1, "name": "Cables Bin", "description": "Various cables and connectors"},
            {"number": 2, "name": "Electronics Bin", "description": "Electronic components and adapters"},
            {"number": 3, "name": "Power Supplies Bin", "description": "DC power supplies and AC adapters"},
            {"number": 4, "name": "3D Printing Bin", "description": "3D printing accessories and supplies"},
        ]
        
        bins = {}
        for bin_data in bins_data:
            if not crud.get_bin_by_number(db, bin_data["number"]):
                bin_obj = crud.create_bin(db, schemas.BinCreate(**bin_data))
                bins[bin_data["number"]] = bin_obj
                print(f"Created bin: Bin {bin_obj.number}")
        
        # Refresh bins dict
        for bin_obj in crud.get_bins(db):
            bins[bin_obj.number] = bin_obj
        
        # Create parts from your existing inventory
        parts_data = [
            # BIN 3 - Power Supplies
            {"name": "Dell 19.5v 2.31a DC power supply", "quantity": 2, "part_type": "Power Supply", "specifications": "19.5V 2.31A with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "UBTECH DVE DC switching power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "9.6V 2A with barrel jack", "manufacturer": "UBTECH", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "5V 2A DC switching power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "5V 2A with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "6V 0.3A DC power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "6V 0.3A with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "12V 0.5A DC power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "12V 0.5A with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "5V 0.7A DC power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "5V 0.7A with USB micro jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "Nintendo DS Lite AC adapter", "quantity": 1, "part_type": "Power Supply", "specifications": "USG-002", "manufacturer": "Nintendo", "model": "USG-002", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "5V 4A DC power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "5V 4A with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "Lenovo 65W USB-C power supply", "quantity": 2, "part_type": "Power Supply", "specifications": "65W USB-C", "manufacturer": "Lenovo", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "5V 1A DC power supply for AV2HDMI", "quantity": 1, "part_type": "Power Supply", "specifications": "5V 1A with USB mini jack for Digitech AV2HDMI RCA to HDMI converter", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "USB-C multi-voltage power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "5V 3A / 9V 2A / 12V 1.5A USB-C", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            {"name": "Adjustable DC power supply", "quantity": 1, "part_type": "Power Supply", "specifications": "3VDC-12VDC adjustable with barrel jack", "bin_id": bins[3].id, "category_id": categories["Power Supplies"].id},
            
            # BIN 1 - Cables
            {"name": "USB 3.0 Type A to Type B cable", "quantity": 1, "part_type": "Cable", "specifications": "1.5m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "HDMI to HDMI cable", "quantity": 3, "part_type": "Cable", "specifications": "1.5m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB Micro cable", "quantity": 1, "part_type": "Cable", "specifications": "1.5m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB-C cable", "quantity": 1, "part_type": "Cable", "specifications": "15cm length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB-C cable", "quantity": 3, "part_type": "Cable", "specifications": "1.2m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB-C cable", "quantity": 1, "part_type": "Cable", "specifications": "3m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "VGA to VGA cable", "quantity": 1, "part_type": "Cable", "specifications": "1.8m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB-C cable", "quantity": 1, "part_type": "Cable", "specifications": "50cm length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "C13 10A to GPO 10A power cable", "quantity": 1, "part_type": "Cable", "specifications": "1.5m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB Micro cable", "quantity": 2, "part_type": "Cable", "specifications": "1m length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "Figure-8 to GPO power cable", "quantity": 1, "part_type": "Cable", "specifications": "1.5m 10A", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "Jaybird USB-A Charging Cable", "quantity": 1, "part_type": "Cable", "specifications": "Jaybird brand", "manufacturer": "Jaybird", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "PSU modular cables bundle", "quantity": 1, "part_type": "Cable", "specifications": "Bundle of PSU cables for modular power supplies", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "SATA Cables", "quantity": 2, "part_type": "Cable", "specifications": "SATA data cables", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            {"name": "USB-A to USB Mini cable", "quantity": 1, "part_type": "Cable", "specifications": "30cm length", "bin_id": bins[1].id, "category_id": categories["Cables"].id},
            
            # BIN 2 - Electronics
            {"name": "Digitech AV2HDMI RCA to HDMI converter", "quantity": 1, "part_type": "Converter", "specifications": "RCA to HDMI converter", "manufacturer": "Digitech", "model": "AV2HDMI", "bin_id": bins[2].id, "category_id": categories["Adapters"].id},
            {"name": "Vivitar DVR 1080p HDMI to USB video capture", "quantity": 1, "part_type": "Capture Device", "specifications": "1080p HDMI to USB video capture device", "manufacturer": "Vivitar", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "DWA-192 AC1200 Dual Band Wireless USB Adapter", "quantity": 1, "part_type": "Network Adapter", "specifications": "AC1200 Dual Band Wireless", "model": "DWA-192", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "Maycar Arduboy", "quantity": 1, "part_type": "Gaming Device", "specifications": "Handheld gaming device", "manufacturer": "Maycar", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "1-Port PCI Express Gigabit Network Card", "quantity": 1, "part_type": "Network Card", "specifications": "PCI Express Gigabit Ethernet", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "3.5 HDD Cage for be quiet! case", "quantity": 1, "part_type": "PC Component", "specifications": "3.5 inch HDD mounting cage", "manufacturer": "be quiet!", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "PCI Slot Covers", "quantity": 2, "part_type": "PC Component", "specifications": "Standard PCI slot covers", "bin_id": bins[2].id, "category_id": categories["Electronics"].id},
            {"name": "Apple Mini DisplayPort to DVI adapter", "quantity": 1, "part_type": "Adapter", "specifications": "Mini DisplayPort to DVI", "manufacturer": "Apple", "bin_id": bins[1].id, "category_id": categories["Adapters"].id},
            
            # BIN 4 - 3D Printing
            {"name": "Elastic straps", "quantity": 1, "part_type": "Accessory", "specifications": "Bag of elastic straps, various sizes", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Creality K1 Max Spool Holder", "quantity": 1, "part_type": "3D Printer Part", "specifications": "Spool holder for K1 Max", "manufacturer": "Creality", "model": "K1 Max", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "JST Connector Kit", "quantity": 1, "part_type": "Connector", "specifications": "JST connector kit", "bin_id": bins[4].id, "category_id": categories["Electronics"].id},
            {"name": "PTFE Tubing offcuts", "quantity": 1, "part_type": "3D Printer Part", "specifications": "Bag of PTFE tubing offcuts", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Cleaning Filament", "quantity": 1, "part_type": "3D Printer Part", "specifications": "Bag of cleaning filament", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Filament Vacuum Bags", "quantity": 30, "part_type": "Storage", "specifications": "Vacuum storage bags for filament", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Vacuum Bag Pump", "quantity": 1, "part_type": "Tool", "specifications": "Pump for vacuum storage bags", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "3D Printer Nozzle Cleaning Needles", "quantity": 10, "part_type": "Tool", "specifications": "Cleaning needles for 3D printer nozzles", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Metal Grease", "quantity": 1, "part_type": "Lubricant", "specifications": "Tube of metal grease", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Creality Unicorn Nozzle", "quantity": 1, "part_type": "3D Printer Part", "specifications": "0.4mm nozzle", "manufacturer": "Creality", "model": "Unicorn 0.4mm", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Creality Manual Bed Leveling Kit", "quantity": 1, "part_type": "3D Printer Part", "specifications": "Manual bed leveling kit", "manufacturer": "Creality", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Bed Leveling Feet", "quantity": 8, "part_type": "3D Printer Part", "specifications": "Adjustable bed leveling feet", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
            {"name": "Creality K1 Max Original Hotend Assembly", "quantity": 1, "part_type": "3D Printer Part", "specifications": "Original hotend assembly", "manufacturer": "Creality", "model": "K1 Max", "bin_id": bins[4].id, "category_id": categories["3D Printing"].id},
        ]
        
        # Create parts
        for part_data in parts_data:
            existing_part = db.query(crud.database.Part).filter(
                crud.database.Part.name == part_data["name"],
                crud.database.Part.bin_id == part_data["bin_id"]
            ).first()
            
            if not existing_part:
                part = crud.create_part(db, schemas.PartCreate(**part_data))
                print(f"Created part: {part.name}")
        
        print(f"\nDatabase initialization complete!")
        print(f"Categories: {len(crud.get_categories(db))}")
        print(f"Bins: {len(crud.get_bins(db))}")
        print(f"Parts: {len(crud.get_parts(db))}")
        
    finally:
        db.close()

if __name__ == "__main__":
    init_database()