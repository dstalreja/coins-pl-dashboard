# Directory Restructuring - Migration Notes

## Changes Made

The project has been restructured to match the required directory structure:

### New Structure
```
coins-pl-dashboard/
├── code/              # All source code files
│   ├── backend/      # Flask backend (moved from backend/)
│   └── frontend/     # React frontend (moved from frontend/)
├── data/             # Data files (new)
│   ├── trades.json
│   ├── closed-trades.json
│   └── portfolio_placeholder.xlsx
├── tests/            # Test files (new)
├── docs/             # Documentation (new)
├── report/           # Final report (new)
└── README.md         # Updated with all required sections
```

### Key Updates

1. **Backend (`code/backend/app.py`)**:
   - Updated file paths to reference `data/` directory at project root
   - Data files are now loaded from `../data/` relative to the backend code

2. **Frontend**:
   - No changes needed - Excel file remains in `public/` for web serving
   - API configuration uses environment variables

3. **Data Files**:
   - All JSON and Excel files moved to `data/` directory
   - Backend now reads from centralized `data/` location

### Old Directories

The original `backend/` and `frontend/` directories still exist as backups. You can safely delete them after verifying everything works:

```bash
# After verification, you can remove:
rm -rf backend/
rm -rf frontend/
```

### Testing the New Structure

1. **Backend**: 
   ```bash
   cd code/backend
   source venv/bin/activate
   python app.py
   ```

2. **Frontend**:
   ```bash
   cd code/frontend
   npm install  # if needed
   npm run dev
   ```

The backend should now read from `data/trades.json` and `data/closed-trades.json` correctly.

