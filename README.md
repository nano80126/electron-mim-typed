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

### Line Notify

Document [Line Notify](https://notify-bot.line.me/doc/en/)

Authorize GET https://notify-bot.line.me/oauth/authorize

Message post https://notify-api.line.me/api/notify

Token post https://notify-bot.line.me/oauth/token

Status GET https://notify-api.line.me/api/status
 
Revoke POST https://notify-api.line.me/api/revoke

### yarn audit will report lots of vulnerabilities

### 自動復歸

非影響程式運作之警報，每 15 分鐘自動復歸

### 自動連線

斷線後每 5 分鐘嘗試重新連線

### To do list 
    * [x] 設備未開機也可以重連 
    * [ ] 登入以操作回應和重置警報
    * [ ] 使用 mongoDB 紀錄工藝與組態 (ex. IP, port)
    * [ ] LINE NOTIFY, Web socket廣播功能移動至總覽頁面
    * [ ] 重寫報警時改變顏色邏輯
    * [x] 宏崙爐溫線圖(等待檔案提供)
    * [x] 宏崙燒結爐Web socket下達重置警報命令
    * [ ] Line Notify 註冊頁面
    * [ ] 新增ERROR CODE
    * [x] 手動模式不會通知
    * [ ] 自動開始取樣
    * [x] 刪除 Vtech 取樣多餘程式碼
    * [ ] 移除背景警示警報，改為其他方法
    * [x] 確認恆普報警對應的 bit
    * [x] 爐溫曲線圖，使用TXT
    * [ ] 刪除非本專案之多餘檔案
    * [ ] 恆普燒結爐手動狀態不報警
    * [ ] 自動模式邏輯
        * 重開機後自動連線 (包含重連設定)
    
### 新增 MONGODB


### 總覽頁面設計


### Bugs
    * 若爐子處於未啟動狀態，無法啟動開始取樣
    * VTECH 爐第一次連線會 TIMEOUT
    * VTECH 可能需要更換網路線
    * VTECH LOG 紀錄有異常
    * 開始取樣按鈕不會自動復歸 (持續發生，發現原因修復後待觀察)
    * 警報重置後，報警有可能沒重置

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

