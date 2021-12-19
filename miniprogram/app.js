//app.js

App({
  onLaunch: function (options) {
    

   wx.showLoading({
     mask:true
   })

    let that = this
 
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'bat',
        traceUser: true,
      })

    }


    wx.getSystemInfo({
      success(res) {
        that.platform = res.platform
        that.screenHeight=res.screenHeight
        that.screenWidth=res.screenWidth
      }
    })
    wx.setInnerAudioOption({
      mixWithOther: true,
      obeyMuteSwitch:false,
      speakerOn:true,
    })
    // wx.cloud.callFunction({
    //   name:'accessToken',
    //   data:{token:""},
    // }).then(res=>{
    //   this.token= res.result.access_token
    //   wx.cloud.callFunction({
    //     name:'accessToken',
    //     data:{token:this.token,type:"list"},
    //   }).then(res=>{
    //     console.log(res)
    //   })

    // })
    // wx.cloud.callFunction({
    //   name:'accessToken',
    //   data:{token:this.token,type:"sendMessage"},
    // }).then(res=>{
    //   console.log(res)
    // })
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      this.openid = res.result.openid
      this.unionid = res.result.unionid

      const db = wx.cloud.database()
      const _ = db.command
      db.collection('appSetting').doc('app_setting').get().then(res => {
        
        this.setting = res.data
        let that=this
 //用户数据识别
 db.collection(this.setting.dbName).doc(this.openid).get({
  fail: function (res) {
    //创建新记录
    let d = {
      _id: that.openid,
      unionid: that.unionid,
      registerDate:new Date(),
      mode:1,
      loop:true,
      checkedMaterials:[],
      matChecked:{},
      tCount:0
    }
    wx.showToast({
      title: '恭喜您获得新用户7天会员时长',
      duration:5000,
      icon:'none'
    })
    that.vip=true
    db.collection(that.setting.dbName).add({
      data: d,
      success() {
        that.userData=d
        console.log('app.options',options)
        if(options.query.inviter){
          wx.showModal({
            title:'感谢您接受好友的推荐，我们已向您的好友赠送会员天数',
            content:'若未关注公众号请关注公众号',
            showCancel: false,
            success(res){
              
              // db.collection(this.setting.dbName).doc(options.query.inviter).update({

              // })
              if(res.confirm){
                wx.navigateTo({
                  url: './pages/webview/webview/?url=https://mp.weixin.qq.com/s/2rZloLHAyHshP3wu3Kfshw',
                })
              }
            }
          })
        }

      }
    })

  },
  success: function (res) {
    //老用户登陆
    console.log('老用户', res)
    that.userData = res.data
    let initial=  {mode:1,checkedMaterials:[],matChecked:{},tCount:0,loop:true, totalChecked:0,vipEndDate:0,isVip:false,codes:[]}
    for(var i in initial){
      if(that.userData[i]==undefined){
      that.userData[i]=initial[i]
    }
    }
    //判断会员券效力
    // if(options.query.vipdays!=undefined){
    //   if(options.query.code==undefined){
    //     wx.showModal({
    //       title:'会员券无效',
    //       showCancel: false,
    //     })
    //     options.query.vipdays=undefined
    //   }else if(that.userData.codes.includes(options.query.code)){
    //     wx.showModal({
    //       title:'请勿重复领取',
    //       showCancel: false,
    //     })
    //     options.query.vipdays=undefined
    //   }else{
    //     that.userData.codes.push(options.query.code)
    //   }
    // }

    //会员判断

    if(!that.userData.isVip){
      //新用户获得7天会员
     
      if(new Date(that.userData.registerDate).getTime()+604800000>new Date().getTime()){
        that.vip=true
      }else{that.vip=false}
  
     //若有会员赠送则开启会员 ？ 如何避免重复？
    //  if(options.query.vipdays!=undefined){
    //   that.userData.vipEndDate=new Date().getTime()+options.query.vipdays*86400000
    //   that.vip=true
    //   that.userData.isVip=true
    //  }else{
   
    //    that.vip=false
    //   }

    }else{
     
      //当前为会员
      //是否在有效时间内
      if(that.userData.vipEndDate<new Date().getTime()){
        that.vip=false
        that.userData.isVip=false
        // if(options.query.vipdays!=undefined){
        //   that.userData.vipEndDate=new Date().getTime()+options.query.vipdays*86400000
        //   that.userData.isVip=true
        //   that.vip=true
        // }
      }else{
        //仍在有效期内
        // if(options.query.vipdays!=undefined){
        //   that.userData.vipEndDate=that.userData.vipEndDate+options.query.vipdays*86400000
        //   that.vip=true
        // }
        that.vip=true
      }   
    }
  
    db.collection(that.setting.dbName).doc(that.openid).update({
      data:_.set(that.userData),
      success(res){
        console.log("已更新用户记录")
      }
    })
   
    //及时更新用户信息与最近登陆时间进数据库
    // db.collection(that.setting.dbName).doc(that.openid).update({
    //   data: {
    //     lastLogin: new Date().toString(),
    //   }
    // })
  },
  complete(){
    wx.hideLoading({
      success: (res) => {},
    })
  }

})
      })
      that.matHistory = {
      }
      
      //会员身份识别
      db.collection('unionids').doc(this.unionid).get().then(res => {
        if (res) {
          that.vip = true
          db.collection(that.setting.dbName).doc(that.openid).update({
            data:{
              isVip:true
            },
            sucess(){
              db.collection('unionids').doc(that.unionid).remove({})
            }
          })
          // if (!res.endDate) {
          //   this.vip = true
            
          // } else {
          //   if(res.endDate==-1){
          //     this.vip = true
          //   }else{
          //     let d = new Date()
          //     if (res.endDate>= d.getTime()) {
          //       this.vip = true
          //     } else {
          //       this.vip = false
          //     }
          //   }
            

          // }

        }
      }).catch(res => {
        if (res) {
          console.log('非会员')
        }
      })


    })
    
  }
  
})