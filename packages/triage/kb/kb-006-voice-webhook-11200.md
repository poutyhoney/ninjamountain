---
id: kb-006
title: "Webhook/TwiML errors: 11200 and 21200"
---

**11200 HTTP retrieval failure** means Twilio sent an HTTP request to a configured webhook URL
and did not receive a successful response it could use. Documented causes include a 4xx or 5xx
response, a connection failure, a response Twilio could not parse, a firewall/WAF/rate limiter
blocking the request, a redirect to an invalid or unreachable destination, or HTTP
authentication that Twilio cannot satisfy. Intermittent 11200s are often caused by infrastructure
in front of the app, such as a WAF, firewall, load balancer, or network path, but the exact
failed request should be confirmed in Voice logs, Debugger, and the customer's server logs.

**21200 Calls Resource** is a different failure on outbound call creation. It means the API
request to create a Call is missing or using invalid call-creation parameters, such as omitting
`to` or `from`, not providing one of `url`, `twiml`, or `applicationSid`, using a `from` value
that is not a Twilio number or verified outgoing caller ID, using an unsupported callback
method, or supplying an invalid/non-public URL. Related, more specific errors such as **21201**
or **21213** may identify the missing `to` or `from` parameter directly.

Outbound calls always start with an API request to the Calls resource. `<Dial>` cannot initiate
a new outbound call from Twilio by itself; it connects another party to an already active call.
When a customer says `<Dial>` "isn't calling out," first confirm whether there was an active
call executing that TwiML, then inspect how the call was originated and which URL or inline
TwiML Twilio was instructed to use.
