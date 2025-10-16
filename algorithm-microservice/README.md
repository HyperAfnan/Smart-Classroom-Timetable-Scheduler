# Timetable API

Modular FastAPI service for generating classroom timetables using a Genetic Algorithm (GA).

This package is a refactor of the original monolithic `src/main.py` app into a clean, extensible structure without changing the API behavior or response shapes.

## Features

- GA-based timetable generation
- Student, teacher, and combined views
- Flat table-friendly export
- CORS-configurable
- Clean, testable architecture

## Project layout

```
timetable_api/
├── app/
│   ├── core/
│   │   ├── config.py            # Settings and CORS helpers
│   │   └── utils.py             # Logging, timing, helpers (optional utilities)
│   ├── models/
│   │   ├── request_models.py    # Pydantic request models
│   │   └── response_models.py   # Pydantic response models
│   ├── routes/
│   │   ├── example_routes.py    # Example/smoke-test routes
│   │   └── timetable_routes.py  # Timetable API routes (unchanged behavior)
│   ├── schemas/
│   │   ├── combined_timetable.py
│   │   ├── slot_info.py
│   │   ├── student_timetable.py
│   │   ├── teacher_timetable.py
│   │   └── timetable_response.py  # Re-exports response models for compatibility
│   ├── services/
│   │   ├── generator.py         # GA engine (extracted TimetableGenerator)
│   │   └── statistics.py        # Stats utilities (optional)
│   ├── __init__.py
│   └── main.py                  # FastAPI app wiring
├── tests/
│   ├── test_generator.py
│   ├── test_routes.py
│   └── __init__.py
├── requirements.txt
└── run.py                       # Uvicorn runner
```

## Requirements

- Python 3.9+
- See `requirements.txt` for pinned versions (FastAPI compatible with Pydantic v1)

```
fastapi>=0.95.2,<0.100
pydantic>=1.10.2,<2
uvicorn[standard]>=0.20.0,<1.0
numpy>=1.23,<2.0
```

## Quickstart

1) Create and activate a virtual environment:

```
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

2) Install dependencies:

```
pip install -r timetable_api/requirements.txt
```

3) Run the API:

- Option A (recommended): use the provided runner

```
python timetable_api/run.py --host 0.0.0.0 --port 8000
```

- Option B: uvicorn directly

```
uvicorn timetable_api.app.main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs for the interactive API docs.

## Configuration

These environment variables are read by `app/core/config.py`:

- APP_NAME: Application title (default: Timetable Generator API)
- APP_VERSION: Version string (default: 1.0.0)
- DEBUG: true/false (default: false)
- CORS_ALLOW_ORIGINS: Comma-separated or JSON array of allowed origins
- CORS_ALLOW_CREDENTIALS: true/false (default: true)
- CORS_ALLOW_METHODS: Comma-separated or JSON array (default: ["*"])
- CORS_ALLOW_HEADERS: Comma-separated or JSON array (default: ["*"])

## Endpoints

The API surface is preserved from the original monolith:

- GET `/` — Service info
- GET `/example-request` — Example request payload
- POST `/generate-timetable/legecy` — Full views (student, teacher, combined)
- POST `/generate-timetable/combined` — Combined view only
- POST `/generate-timetable/teacherwise` — Combined view only (compat behavior)
- POST `/generate-timetable/studentwise` — Student view plus teacher/combined
- POST `/generate-timetable/flat` — Flat rows for table UI
- GET `/examples/ping|echo|info` — Example routes (scaffold)

Example request body:

```
{
  "num_classes": 3,
  "days": 5,
  "slots_per_day": 6,
  "total_rooms": 6,
  "total_teachers": 8,
  "subject_hours": {"0": 4, "1": 3, "2": 3},
  "subject_teachers": {"0": [0, 1], "1": [2, 3], "2": [4, 5]},
  "class_names": ["Class A", "Class B", "Class C"],
  "subject_names": ["Math", "English", "Science"],
  "teacher_names": ["T0", "T1", "T2", "T3", "T4", "T5", "T6", "T7"],
  "room_names": ["R0", "R1", "R2", "R3", "R4", "R5"],
  "population_size": 60,
  "generations": 80,
  "mutation_rate": 0.02
}
```

## Embedding the app

If you need the ASGI app instance:

```
from timetable_api import app  # lazy
# or
from timetable_api.app.main import app
```

## Testing

Optionally install pytest and run the tests:

```
pip install pytest
pytest -q
```

## Notes

- The Genetic Algorithm and response shapes are functionally identical to the original `src/main.py`.
- `schemas/timetable_response.py` re-exports response models to keep existing imports working.
- The service maintains the same route paths and response models, enabling a drop-in replacement.