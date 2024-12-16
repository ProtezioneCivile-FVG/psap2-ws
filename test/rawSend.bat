@echo off
cls

set xmlfile=%1
echo File sent is %xmlfile%

set url=http://localhost:8001/Nue_Services/EntiService
@REM set url=http://localhost:8001/Nue_Services/EntiService/GestContatto


set h1="SOAPAction: ""http://entiservice.ws.nue.gov.it/Nue_Services/EntiService/GestContatto"""

echo %h1%

curl --header %h1% -X POST -d @%xmlfile% %url%

echo Done
