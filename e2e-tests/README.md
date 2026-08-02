# Flowvia E2E Tests

End-to-end tests for Flowvia using Selenium WebDriver with Python and pytest.

## Prerequisites

1. **Python 3.11+** - Install from https://www.python.org/
2. **Docker** - For running Selenium Grid
3. **Chrome/Chromium** browser (provided by Selenium Docker image)

## Running Tests Locally

### Quick Start (Recommended)

Use the provided test runner script:

```bash
cd e2e-tests
./run-tests.sh
```

The script will:
- Check for required dependencies (Docker, Python)
- Start Selenium container automatically
- Create a Python virtual environment
- Install test dependencies
- Prompt you to start the Flowvia app if not running
- Run the tests
- Clean up Selenium container

### Manual Setup

1. Start Selenium server with Chrome:
   ```bash
   docker run -d --name flowvia-selenium -p 4444:4444 -p 7900:7900 --shm-size="2g" selenium/standalone-chrome:latest
   ```

2. Start the Flowvia dev server:
   ```bash
   cd ..  # Go to project root
   npm run dev
   ```

3. Install Python dependencies:
   ```bash
   cd e2e-tests
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Run the tests:
   ```bash
   pytest -v
   ```

## Environment Variables

- `FLOWVIA_TEST_URL` - Base URL of the app (default: `http://localhost:3000`)
- `WEBDRIVER_URL` - WebDriver endpoint (default: `http://localhost:4444`)

Example:
```bash
FLOWVIA_TEST_URL=http://localhost:8080 pytest -v
```

## Available Tests

18 tests across 8 files in `tests/`:

- `test_basic_load.py` - `test_can_connect_to_server`, `test_homepage_loads`, `test_page_has_body_and_root`, `test_javascript_is_executing`, `test_app_renders_diagram_components`
- `test_base_path_routing.py` - `test_app_loads_at_base_path`, `test_static_assets_load_correctly`, `test_react_router_navigation_works`, `test_router_basename_detection`, `test_no_console_errors_at_base_path`
- `test_node_placement.py` - `test_place_node_on_canvas`, `test_undo_redo_node`
- `test_rect_text_undo.py` - `test_rectangle_undo_redo`, `test_textbox_undo_redo`
- `test_connector_undo.py` - `test_connector_undo_redo` (place 2 nodes, connect, undo/redo the connector)
- `test_multi_node_undo.py` - `test_multi_node_undo_redo` (undo/redo across multiple nodes, including forked history)
- `test_export_svg.py` - `test_export_svg` (build a scene and export it to SVG)
- `test_import_diagram.py` - `test_import_via_app_button` (import a diagram JSON via the MainMenu "Open" action)

There's also `test_store_debug.py`, a standalone manual debugging script (not collected by pytest, no `test_*` functions) for inspecting store state directly - run it with `python test_store_debug.py`, not `pytest`.

## CI/CD

The E2E workflow (`.github/workflows/e2e-tests.yml`) runs on:
- Pull requests to `master` or `main`
- Completion of the "Run Tests" workflow on `master` or `main` (only proceeds if that workflow succeeded)
- Manual trigger via `workflow_dispatch`

It does **not** run on every push - only on PRs, after unit tests pass, or on demand.

The CI workflow:
1. Builds the Flowvia library and app
2. Starts the app server in background
3. Starts Selenium standalone Chrome
4. Installs Python dependencies
5. Runs all E2E tests with pytest

## Test Structure

```
e2e-tests/
├── tests/
│   ├── test_basic_load.py          # Smoke tests: page load, JS execution, DOM structure
│   ├── test_base_path_routing.py   # Serving the app from a sub-path (React Router basename)
│   ├── test_node_placement.py      # Placing a node + undo/redo
│   ├── test_rect_text_undo.py      # Rectangle/text-box undo/redo
│   ├── test_connector_undo.py      # Connector undo/redo
│   ├── test_multi_node_undo.py     # Multi-node undo/redo with forked history
│   ├── test_export_svg.py          # Export a scene to SVG
│   ├── test_import_diagram.py      # Import a diagram JSON
│   └── test_store_debug.py         # Manual debug script, not a pytest suite
├── requirements.txt           # Python dependencies
├── pytest.ini                 # Pytest configuration
├── run-tests.sh              # Test runner script
└── README.md                 # This file
```

## Adding New Tests

1. Create a new test file in `tests/` directory (must start with `test_`)
2. Import required modules:
   ```python
   import pytest
   from selenium import webdriver
   from selenium.webdriver.common.by import By
   ```

3. Use the `driver` fixture:
   ```python
   def test_my_feature(driver):
       driver.get("http://localhost:3000")
       element = driver.find_element(By.ID, "my-element")
       assert element.is_displayed()
   ```

4. Run your test:
   ```bash
   pytest tests/test_my_feature.py -v
   ```

## Debugging

### Running with Visible Browser

To see the browser during tests, modify the driver fixture in `test_basic_load.py`:
```python
# Comment out headless mode
# chrome_options.add_argument("--headless")
```

### Using VNC to Watch Tests

When using the Selenium Docker image, you can watch tests in real-time:

1. Connect to VNC viewer at `http://localhost:7900` (password: `secret`)
2. Remove `--headless` from Chrome options
3. Run tests and watch in VNC viewer

### Verbose Output

Run tests with more verbose output:
```bash
pytest -vv --tb=long
```

### Add Screenshots on Failure

```python
def test_example(driver):
    try:
        # Your test code
        assert something
    except AssertionError:
        driver.save_screenshot("failure.png")
        raise
```

### Running Specific Tests

```bash
# Run a single test
pytest tests/test_basic_load.py::test_homepage_loads -v

# Run tests matching a pattern
pytest -k "canvas" -v
```

## Troubleshooting

### Connection refused errors
- Ensure Selenium is running: `docker ps | grep selenium`
- Check Selenium status: `curl http://localhost:4444/status`
- Ensure Flowvia app is running: `curl http://localhost:3000`

### Element not found errors
- Increase wait times in tests
- Check if the app URL is correct
- Verify the app loaded successfully in browser

### Import errors
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Docker container conflicts
- Remove existing container: `docker rm -f flowvia-selenium`
- Check for port conflicts: `lsof -i :4444`

## Dependencies

- **selenium** (4.27.1) - WebDriver automation library
- **pytest** (8.3.4) - Testing framework
- **pytest-xdist** (3.6.1) - Parallel test execution support

## Future Test Coverage

Beyond the current suite (node placement, connectors, rectangles/text, multi-node history, SVG export, JSON import, base-path routing, and their undo/redo), coverage could expand to:

- **Drawing Features**: editing node properties, deleting nodes
- **UI Interactions**: menu navigation, settings dialogs, tool selection, hotkeys
- **Data Operations**: save/load, export to JSON (only SVG export is currently tested)
- **Advanced Features**: custom icons, multi-select, zoom/pan
