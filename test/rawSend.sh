#!/bin/bash
clear

xmlfile=$1
echo File sent is $xmlfile

url=http://172.22.40.3:8001/Nue_Services/EntiService

h1="SOAPAction: \"http://entiservice.ws.nue.gov.it/Nue_Services/EntiService/GestContatto\""
echo $h1

curl --header $h1 -X POST -d @$xmlfile $url

echo Done
