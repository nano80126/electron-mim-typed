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


### Check .env variable can be used in node environment even if it is not VUE_APP_XXX format


### Update to electron-11

### Use mongodb to save steps

### To do list 

* [*] Redirect if wrong path or refresh
* [x] Save IP and port in hipermodule if connected
* [x] Divide socket api for two furnace
* [ ] Login for response and reset alarm 
* [x] Use Web Worker to deal data
* [x] vtech farnace 
* [x] Add alarm audio 
* [ ] Add mongoDB for recording work step history 
* [x] Add enum between ipcMain and ipcRenderer (invoke and handle done ex. connect, disconnect, sample)
* [x] Vtech Connect.vue 返回
* [ ] Make sure no duplicated mutation exist in hiper and vtech module
* [x] Add comment of modbus tcp return
* [x] Add error json of HIPER
* [ ] Move broadcast, line notify to overall page 
* [ ] Rewrite changing background color logic 

## bugs
* [ ] Progress is not full when uploading csv
* [ ] log4js not create log files in logs

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

