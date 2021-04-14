# electron-min

MIM Sintering furnace server

Using Modbus TCP to get equipment status


HIPER:
    Address: 192.168.3.18:502

VTECH:
    Address: 192.168.3.39:1028

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
    * [ ] 登入以操作回應和重置警報
    * [ ] 使用 mongoDB 紀錄工藝與組態 (ex. IP, port)
    * [ ] LINE NOTIFY, Web socket廣播功能移動至總覽頁面
    * [ ] 重寫報警時改變顏色邏輯
    * [ ] 宏崙爐溫線圖(等待檔案提供)
    * [*] 宏崙燒結爐Web socket下達重置警報命令
    * [ ] Line Notify 註冊頁面

### Bugs
    * 若爐子處於未啟動狀態，無法開啟自動連線與取樣


### 爐子報警後通知，尚未測試冷卻時間


### log 分類
    * INFO: 通知
        * 開啟每日通知
        * 觸發每日通知
        * 燒結爐連線成功
        * 手動回應報警
        * 手動重置報警
        * 新客戶端連線
    * WARNING
        * 燒結爐連線中斷
        * 燒結爐無回應
        * 燒結爐連線失敗
        * 遠端下達回應或重置命令時，燒結爐沒有連線
    * ERROR
        * 每日通知失敗
        * 報警通知失敗
        * Web socket server發生錯誤



### 

