//index.js
const app = getApp()

Page({
  data: {
    zhenti:false
  },
  // onSaveExitState: function() {
  //   var exitState = { myDataField: 'myData' } // 需要保存的json数据
  //   return {
  //     data: exitState,
  //     expireTimeStamp: Date.now() + 24 * 60 * 60 * 1000 // 超时时刻
  //   }
  // },
  onLoad: function() {
    
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        
        const canvas = res[0].node
       
        const ctx = canvas.getContext('2d')
    
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        ctx.lineWidth=0.1
       
        for(var a=10;a<canvas.width;a=a+10){
         
          ctx.beginPath()
          ctx.moveTo(a,0)
          ctx.lineTo(a,canvas.height)
          ctx.stroke()
         
        }
        for(var a=10;a<canvas.height;a=a+10){
         
          ctx.beginPath()
          ctx.moveTo(0,a)
          ctx.lineTo(canvas.width,a)
          ctx.stroke()
         
        }
       
        
      })

wx.showShareMenu({
      menus: ['shareAppMessage','shareTimeline']
    })
  },
  pa(){

    wx.navigateTo({
      url: '../webview/webview?url=https://mp.weixin.qq.com/s/2rZloLHAyHshP3wu3Kfshw',
    })
    // wx.previewImage({
    //   urls: ['https://6261-bat-1259770860.tcb.qcloud.la/logoCaption.png'],
    //   showmenu:'true'
    // })
  },
  onShow:function(){

  },

  toLists(e){
let that =this
    if(e.target.id=="news"){
      if(app.setting.cs){
        wx.showModal({
          title: '即将开放，请先跟随公众号打卡',
          showCancel:false
        })
        return
      }
      wx.navigateTo({
        url: '../list/list?list=news',
      })
    }
    else if(e.target.id=="wordDict"){
      wx.navigateTo({
        url: '../wordDict/wordDict',
      })
    }else if(e.target.id=="video"){
      wx.navigateTo({
        url: '../contents/contents',
      })
 
    }else{
      that.setData({
        zhenti:true
      })
      // wx.showActionSheet({
      //   itemList: ['六级真题','专四真题'],
      //   success(res){
      //     if(res.tapIndex==0){
      //       console.log(res)
      //   wx.navigateTo({
      //   url: '../list/list?list=cet6',
      // })
      //     }else if(res.tapIndex==1){
      //       wx.navigateTo({
      //         url: '../list/list?list=tem4',
      //       })
      //     }
      //   }
      // })
    }
    


  },
  zhenti(e){
    let that =this
    if(e.target.id=="back"){
      that.setData({
        zhenti:false
      })
    }
    if(e.target.id=="cet6"){
        wx.navigateTo({
        url: '../list/list?list=cet6',
      })
    }
    if(e.target.id=="tem4"){
          wx.navigateTo({
              url: '../list/list?list=tem4',
            })
    }
    
    
  },
onShareAppMessage(){
  
},
// onShareTimeline(e){
// e.title='欢迎使用蝙蝠听写'
// }
})
