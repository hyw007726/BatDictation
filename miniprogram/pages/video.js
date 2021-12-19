// miniprogram/pages/video.js
const TxvContext = requirePlugin("tencentvideo")
const app=getApp()
app.speed=1
Page({

  /**
   * 页面的初始数据
   */
  data: {
vid:'',
title:'蝙蝠听写精选视频',
height:app.screenHeight*0.33,
bSize:20,
slow:false,
alreadySlow:false,
ifPlay:true,
hide:false,
backLength:2,
speed:1,
adEnd:false,
barText:"我是字幕遮挡君"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    if(options.v!=undefined){
      if(app.setting==undefined){
        let int=setInterval(() => {
          if(app.setting!=undefined){         
            this.setData({
              title:app.setting.tvs[options.v].t,
              vid:app.setting.tvs[options.v].vid
            })
            app.t=TxvContext.getTxvContext(this.data.vid) 
            wx.hideLoading({
              success: (res) => {},
            })
            clearInterval(int)

          }
        }, 50);
      }else{
        this.setData({
          title:app.setting.tvs[options.v].t,
          vid:app.setting.tvs[options.v].vid
        })
        app.t=TxvContext.getTxvContext(this.data.vid) 
        wx.hideLoading({
          success: (res) => {},
        }) 
      }
    }
    
    else{

      this.setData({
        vid:"m32577bdp2n"
      })
    }

  },
  size(){
    if(this.data.bSize==20){
      this.setData({
        bSize:25
      })
    }else if(this.data.bSize==25){
      this.setData({
        bSize:30
      })
    }else if(this.data.bSize==30){
      this.setData({
        bSize:35
      })
    }else if(this.data.bSize==35){
      this.setData({
        bSize:20
      })
    }
  },
  
  fullscreen(e){
    app.fullscreen=e.detail.fullscreen

  },
  time(e){
    app.time=e.detail.currentTime
  },
  speed(){
    if(app.speed==1){
      app.speed=0.8
     
    }else if(app.speed==0.8){
      app.speed=0.5
   
    }else if(app.speed==0.5){
      app.speed=1
    }
    this.setData({
      speed:app.speed
    })
    app.t.playbackRate(app.speed)
  },
  tap(e){
   
   
  },
  move(e){
 
    let t=0
    if(!app.fullscreen){
      t=app.screenHeight
      if(e.touches[0].pageY>t*0.46||e.touches[0].pageY<t*0.08){
        return
      }
    }else{
    t=app.screenWidth
    }
    this.setData({
      height:e.touches[0].pageY-this.data.bSize-t*0.05
    })
    
  },

  back(){
    app.t.seek(app.time-3)
  },

  pa(){
    wx.navigateTo({
      url: 'webview/webview?url=https://mp.weixin.qq.com/s/2rZloLHAyHshP3wu3Kfshw',
    })
  },

  switch(){
  this.setData({
    hide:!this.data.hide,
    barText:this.data.hide?'我是字幕遮挡君':'遮'
  })

    
  },

bindplay(e){
  this.setData({
    ifPlay:true
  })
},
bindpause(e){
  this.setData({
    ifPlay:false
  })
},
bindstate(e){
  // console.log(e)
},
bindended(e){
  // console.log(e.detail.isAd)
  if(e.detail.isAd){
    this.setData({
      adEnd:true
    })
   
  }
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (o) {
    // return {
    //   title: this.data.title,
    //   path: '/pages/video?v=0'
    // }
  },
  onShareTimeline:function () {
    return {
      title: this.data.title,
      query: 'v=0'
    }
  },
  onResize(res){
 


  }
})