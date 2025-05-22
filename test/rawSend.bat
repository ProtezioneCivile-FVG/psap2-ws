@echo off
cls

set xmlfile=%1
echo File sent is %xmlfile%

set url=http://localhost:8001/Nue_Services/EntiService
@REM set url=http://localhost:8001/Nue_Services/EntiService/GestContatto


@REM set h1="SOAPAction: ""http://entiservice.ws.nue.gov.it/Nue_Services/EntiService/GestContatto"""
@REM echo %h1%

@REM curl --header %h1% -X POST -d @%xmlfile% %url%
curl -X POST -d @%xmlfile% %url%

echo Done
