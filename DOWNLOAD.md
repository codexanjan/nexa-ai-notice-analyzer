# Download and run NEXA

For immediate use, open https://nexa-anjan.vercel.app.

For a local copy, download **NEXA-1.2.1-portable.zip** from the [GitHub release](https://github.com/codexanjan/nexa-ai-notice-analyzer/releases/latest). This is a Python web application with its frontend already built, not a native Windows executable.

## Windows

1. Install Python 3.12 or newer from https://www.python.org/downloads/.
2. Extract the ZIP into a writable folder.
3. Double-click `Start-NEXA.cmd`. First launch needs internet access to install dependencies into a local `.venv` folder.
4. When the server starts, open http://127.0.0.1:8000 in your browser.
5. Keep the launcher window open. Press Ctrl+C to stop the application.

Node.js is not required for the portable ZIP. If Windows blocks a downloaded file, review its source and your organization's policy rather than disabling system protections.

## macOS or Linux

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Then open http://127.0.0.1:8000.

## Local data and demo accounts

The local copy saves data in `backend/data`. Its sample student and administrator credentials are documented in README.md. This local demonstration is intended for one computer; use the hosted service or configure a private signing key, durable database and private administrator credentials for a public installation. No production credentials or database connection strings are included in the ZIP.

Images and scanned PDFs require a separately installed OCR engine. Digital PDFs, DOCX and TXT files work in the release. See README.md for feature details and limitations.
