@echo off
REM Test script for gemini_plan.py

echo Testing career plan generation...
python utils/gemini_plan.py "[\"Python\", \"SQL\"]" "Data Scientist" 6

echo.
echo Done!
