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