
# PSAP2 SOAP WebService

Web service SOAP per ricezione schede contatto da PSAP1.


Nel contesto del numero unico delle emergenze (*NUE-112*) il centro di risposta di primo livello (*PSAP1*) intervista brevemente il cittadino che ha chiamato il numero 112 per stabilire il tipo di emergenza ed il centro di gestione verso cui inoltrare la chiamata (*PSAP2*).

I dati raccolti durante l'intervista  - corredati da ulteriori informazioni aggiuntive - vengono inviati al gestore di secondo livello (*PSAP2*) in modo da circostanziare meglio la chiamata senza replicare le domande già poste al chiamante.

L'invio dei dati avviene su una rete informatica riservata con teconlogia SOAP.

Questo applicativo implementa:
- la ricezione della scheda contatto
- la decodifica da formato XML in formato JSON
- il salvataggio in una base dati (attualmente *sqlite*)
- l'invio (opzionale) ad una coda di messaggi (tecnologia [AMQP](https://www.amqp.org/)) per il processamento da parte dell'applicativo di gestione in dotazione al PSAP2
	- questo permette di disaccoppiare l'applicativo di gestione dal canale di ricezione della scheda contatto utilizzando tecnologie standard e protocolli aperti ampiamente utilizzati

Questo software è realizzato in [node.js](https://nodejs.org) in modo da essere cross-platform.

## Installazione

1. clonare il repository git
2. installare le dipendenze: `npm i`
3. copiare il file .env.sample rinominandoli in .env
4. personalizzare il file .env con alcune le informazioni di configurazione personalizzate
5. opzionalmente è possibile configurare l'applicativo come servizio
	- le istruzioni per sistemi operativi basati su linux sono disponibili nel file [service/install.md](service/install.md)

## Configurazione

Per configurare l'applicativo si possono personalizzare i file `.env` e `Options.js`.

### .env
Il file `.env` (che non è sotto versionamento del codice) va creato copiandolo da `.env.sample` e personalizzato modificando le seguenti informazioni:
- porta di ascolto del web server (WS_PORT)
- l'indirizzo IP indicato come endpoint per il servizio SOAP (SOAP_HOST) - default: localhost
- Nel caso di utilizzo della coda di messaggi
	- nome del server su cui è implementata la coda (MQ_HOST)
	- nome dell'eventuale virtual host (MQ_VHOST)
	- eventuali credenziali di accesso nella forma *username:password* (MQ_CREDENTIALS)

### Options.js

Da usare sostanzialmente per abilitare o disabilitare alcune funzionalità.
Per esempio:
- impostare `Options.web.trace` a true implica l'attivazione dei trace SOAP nei log
- impostare `Options.mq.disabled` a true implica la disabilitazione dell'inoltro dei messaggi su una coda
- cambiare `Options.store.type` (default a sqlite) permette l'utilizzo di implementazioni personalizzate dello storage di salvataggio delle schede contatto

## Avvio

Se l'applicativo è stato configurato come servizio l'avvio è automatico al boot (le istruzioni di installazione comprendono anche il primo avvio).

Altrimenti il comando per lanciare il server è
```
node server.js
```
***Nota:*** se l'applicativo è stato configurato per l'utilizzo di porte TCP basse (es 80) il comando va lanciato con *sudo*


## Copyright

Questo applicativo è stato realizzato dalla Protezione Civile della Regione Autonoma Friuli Venezia Giulia che è anche detentrice del copyright.

## Segnalazioni di sicurezza

Eventuali segnalazioni di sicurezza vanno inviate a <portale@protezionecivile.fvg.it>




