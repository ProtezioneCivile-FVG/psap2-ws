# Architettura del sistema

Il sistema è composto da:
- un server web basato su [express.js](https://expressjs.com/)
- un servizio SOAP, integrato al server express, e basato sul pacchetto npm [soap](https://www.npmjs.com/package/soap) (sorgente disponibile su https://github.com/vpulim/node-soap)
- un database sqlite per il salvataggio delle schede
	- l'utilizzo del tipo di base dati è modulare ed è facilmente sostituibile con altri motori di base dati implementando dei moduli di estensione
- una libreria per l'invio delle schede contatto ad un sistema basato su protocollo AMQP

Le schede ricevute attraverso il canale SOAP (inviate dal PSAP1) vengono decodificate, riformattare in JSON e salvate nello storage (dove viene conservato anche l'XML originale), quindi inviate alla coda dei messaggi.

## Coda di distribuzione per le schede contatto

Nell'implementazione fatta in Protezione Civile FVG la coda è realizzata con [RabbitMQ](https://www.rabbitmq.com/).

Uno o più software che volessero ricevere la scheda contatto dovrebbero mettersi in attesa sulla coda utilizzando il protocollo AMQP.
L'applicativo distribuisce i messaggi a tutti i software che si mettono in ascolto utilizzando un meccanismo di replica (exchange di tipo [fanout](https://www.rabbitmq.com/tutorials/amqp-concepts#exchange-fanout))

L'utilizzo della coda garantisce che le schede contatto, in caso di indisponibilità dell'applicativo che ne fa richiesta, vengano salvate e distribuite nel momento in cui l'applicativo ritorna attivo.

