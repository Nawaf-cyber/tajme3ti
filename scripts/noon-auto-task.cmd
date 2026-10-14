@echo off
rem Noon price auto-refresh - run by Windows Task Scheduler ("Tajme3ti - Noon prices", 9am + 9pm)
rem via noon-auto-task.vbs (hidden window). Details: scripts\noon-auto-refresh.ts
rem Log: %LOCALAPPDATA%\tajme3ti\noon-auto.log
cd /d "%~dp0.."
if not exist "%LOCALAPPDATA%\tajme3ti" mkdir "%LOCALAPPDATA%\tajme3ti"
"C:\Program Files\nodejs\node.exe" node_modules\tsx\dist\cli.mjs scripts\noon-auto-refresh.ts --apply >> "%LOCALAPPDATA%\tajme3ti\noon-auto.out" 2>&1
