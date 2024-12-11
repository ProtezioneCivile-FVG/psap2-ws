@echo off
cls

set xmlfile=%1
echo File sent is %xmlfile%

set url=http://localhost:8001/Nue_Services/EntiService
@REM set url=http://localhost:8001/Nue_Services/EntiService/GestContatto

curl -X POST -d @%xmlfile% %url%

echo Done
