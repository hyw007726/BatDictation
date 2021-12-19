// 云函数入口文件
const cloud = require('wx-server-sdk')
var request=require('request')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  if(!event.token){

    return new Promise((resolve,reject)=>{
      request({

      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx066208085adbe1b9&secret=1d484a2298d111c7aed61db439180ff1',
      json: true
  
      },
      function(error, response, body){
        resolve(body)
      }
      )
    })


  }else if(event.type=="list"){
//获得前10000条openid result.data.openid[0-10000] 根据openid可再获取unionid等资料
    return new Promise(
      (resolve,reject)=>{
        request({
          url: 'https://api.weixin.qq.com/cgi-bin/user/get?access_token='+event.token+'&next_openid=',
        },
        function(error, response, body){
        
          resolve(body)
        })
      })

  }
  else if(event.type=="sendMessage"){
    

 return new Promise(
        (resolve,reject)=>{
          let d=JSON.stringify({
            "touser":"oj07n1OVkIQHjV8RHHyK-F3J5fZs",
            "template_id":"mfsSOqIWAwiQNBZxEbqUwQEtZmMUHWjo6dOx95V8eWo",
            "miniprogram":{
              "appid":"wx8dcaca02ada95a84"       
         }, 
               
              "data":{
                      "first": {
                          "value":"恭喜你购买成功！",
                          "color":"#173177"
                      },
                      "keyword1":{
                          "value":"巧克力",
                          "color":"#173177"
                      },
                      "keyword2": {
                          "value":"39.8元",
                          "color":"#173177"
                      },
                      "remark":{
                          "value":"欢迎再次购买！",
                          "color":"#173177"
                      }
              }
          
        })
    
          request({
            url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+event.token,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: d,
          },
          function(error, response, body){
          
            resolve(body)
          })}
      )

  }


}