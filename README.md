# electron-min

MIM Sintering furnace server

Using Modbus TCP to get equipment status

Addreess: 192.168.3.18:502

## Feature

* Connect equipment width electron

* View status at both electron and web

* Line Notify when alarm occurred

## Migrate to typescript

* Lots of things wait for change

### Line Notify

Document [Line Notify](https://notify-bot.line.me/doc/en/)

Authorize GET https://notify-bot.line.me/oauth/authorize

Message post https://notify-api.line.me/api/notify

Token post https://notify-bot.line.me/oauth/token

Status GET https://notify-api.line.me/api/status
 
Revoke POST https://notify-api.line.me/api/revoke

### To do list 

* [*] Redirect if wrong path or refresh
* [ ] Save IP and port in hipermodule if connected
* [ ] Use Web Worker to deal data
* [ ] vtech farnace 
* [ ] Add alarm audio 
* [ ] Add mongoDB for recording work step history 
 
## bug 
* [ ] Progress is not full when uploading csv

## Test list 
* [ ] Test connect 
    * electron
    * web
* [ ] Test disconnect
    * electron
    * web
* [ ] Test reconnect
    * electron
    * web
* [ ] Test Data
    * electron
    * web
* [ ] Daily notify
* [ ] Error response
    * electron
    * web
* [ ] Error reset
    * electron
    * web

