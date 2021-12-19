const app=getApp()

function pay (that){
 
  let rand = ''
  for (var i=0;i < 32;i++){
    rand=rand+Math.floor(Math.random()*10).toString()
  }
  
  wx.cloud.callFunction({
    name: 'cloud_pay',
    data: {
      "body" : "蝙蝠听写终身会员",
      "outTradeNo" : rand,
      "spbillCreateIp" : "127.0.0.1",
      "subMchId" : "1542670191",
      "totalFee" : app.setting.total_fee,
      "envId": "bat",
      "functionName": "cloud_pay"
    },
    success: res => {
      console.log('payres',res)
      const payment = res.result.payment
    
      wx.requestPayment({
        ...payment,
        success (res) {
          console.log('pay success', res)
       
          const db = wx.cloud.database()
          const _ = db.command
          let d = new Date()
          db.collection('unionids').add({
            data:{
              _id:app.unionid,
              ['order'+d.getTime()]:{buyDate:d,no:rand,type:'life',fee:app.setting.total_fee},
              endDate:-1
            },
            success(res){
              console.log(res)
              wx.showModal({
                title: '感谢您购买小程序会员',
                content:'同时开通公众号终身会员请联系客服，微信号satine_zhang',
                showCancel:false
              })
              app.vip=true             
              that.onShow()
            }
          })
        },
        fail (err) {
          console.error('pay fail', err)
          wx.showToast({
            title: '支付失败',
          })
        }
      })
    },
    fail: console.error,
  })
}
module.exports.pay = pay