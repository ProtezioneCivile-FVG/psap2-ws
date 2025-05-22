#!/bin/bash
clear

xmlfile=$1
echo File sent is $xmlfile

url=http://127.0.0.1:8001/Nue_Services/EntiService
echo Server is $url

# h1="http://entiservice.ws.nue.gov.it/Nue_Services/EntiService/GestContatto"
# echo header is
# echo $h1

#curl --header "SOAPAction: $h1" -X POST -d @$xmlfile $url
curl -X POST -d @$xmlfile $url

echo Done
