@echo off

echo Looking files in : %~dp0
for %%i in (%~dp0*.xml) do node %~dp0..\soapSend.js %%i


