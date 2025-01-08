# Installazione ed avvio dell'applicativo come servizio di Linux

- copiare il file service/psap2ws.service in /etc/systemd/system
- avviare il servizio
```
sudo systemctl daemon-reload
sudo service psap2ws start
sudo systemctl enable psap2ws
```

## Visualizzazione dei log

Per visualizzare i log del servizio utilizzare `journalctl`, per esempio:

```sudo journalctl -f -u psap2ws```



