@echo off

echo Looking files in : %~dp0
for %%i in (%~dp0cc_*.xml) do node %~dp0..\soapSend.js %%i
for %%i in (%~dp0EMMA_*.xml) do node %~dp0..\soapSend.js %%i
for %%i in (%~dp0SOCCORSO_*.xml) do node %~dp0..\soapSend.js %%i


