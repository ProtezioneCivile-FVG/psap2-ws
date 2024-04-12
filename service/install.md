# Installazione service node.js

- ```npm i```
- provare a lanciare il servizio con node server.js
- copy or link service/psap2ws.service in /etc/systemd/system
- copy 90-psap2ws.conf in /etc/rsyslog.d
- sudo systemctl daemon-reload
- sudo service psap2ws start
- sudo systemctl enable psap2ws <-- altrimenti il servizio non parte al boot !!!

# Log

```sudo journalctl -f -u psap2ws```
oppure
```tail -f /var/log/psap2ws.log```



