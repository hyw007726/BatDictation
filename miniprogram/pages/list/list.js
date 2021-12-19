// miniprogram/pages/list/list.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var common = require('../pay.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ifRefresh:false,
    vip:false,
    matIds:[],
    listCounter:0,
    audioName:'',
    audioSrc:'',
    ifPlay:false,
    playingID:'',
    wordPic:'',
    picShow:false,
    matType:'',
    audioPath:'',
    toVideo:true,
    modeChosen:'    ',
    totalChecked:0,
    // yesterday:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    
wx.showLoading({
 
})
    let that=this
    app.bam=wx.getBackgroundAudioManager()
   
    app.bam.singer="蝙蝠听写"
    app.bam.coverImgUrl="cloud://bat.6261-bat-1259770860/logo.jpg"

    app.bam.onPlay(function name(params) {
      wx.hideLoading({
        success: (res) => {},
      })
     
      that.setData({
        ifPlay:true
      })          
  })
  app.bam.onPause(function name(params) {
    that.setData({
      ifPlay:false
    })          
})
    if(that.options.today){
      if(app.setting==undefined||app.userData==undefined){
        let int = setInterval(() => {
          if(app.setting!=undefined&&app.userData!=undefined){
            this.getContents("news")
            clearInterval(int)
          }
        }, 50);
      }
  
    }else {
      if(app.setting==undefined||app.userData==undefined){
        let int = setInterval(() => {
          if(app.setting!=undefined&&app.userData!=undefined){
            that.getContents(that.options.list)
            clearInterval(int)
          }
        }, 50);
      }else{
        that.getContents(that.options.list)
      }
    }
 
  

  },
  getContents:function(list){
      
    if(list=="news"){
        if(this.data.listCounter==0){
          app.bam.epname="一分钟新闻听写"
        }
        function dateConvert(n){
        
          let a = String(n).split('')
          var year = '20'+String(a[0])+String(a[1])
          var month = String((a[2]=='0')?'':'1')+String(a[3])
          var day = String((a[4]=='0')?'':a[4])+String(a[5])
          return year+'.'+month+'.'+day
        }
        function getPath(n) {
          let a1= n.substr(0,2)
          let a2 = n.substr(2,1)
          let a3 = n.substr(3,1)
          let b = '20'+a1+'.'
          if(a2=='0'){
            b=b+a3
          }else{
            b=b+a2+a3
          }

          return app.setting.pathA+b+'\/'
        }
      db.collection('materials').where({}).orderBy('d','desc').skip(this.data.listCounter*20)
      .get()
      .then(res=>{
        let l = this.data.matIds.concat(res.data)       
        //转换日期；检查是否打卡       
        let y = 1
        for(var i in l){          
          if(l[i].hour){
      let h =(new Date().getTime()-l[i].hour.getTime())/3600000
      if(h<22){
        l[i].date=Math.ceil(h)+'h ago'
        y++
      } else{
        l[i].date=dateConvert(l[i].d)
      }     
          }else{
            l[i].date=dateConvert(l[i].d)
          }          

          l[i].path=getPath(l[i].d)
          l[i].ifChecked=false
          if(app.userData.checkedMaterials.includes(l[i].m)){            
            l[i].ifChecked=true           
          }
          if(this.options.today&&this.options.today!=0){
            
            if(l[i].d==this.options.today){
              app.today=i
            }
          
        }
        }
        this.setData({
          matIds:l,
          matType:'news',
          // yesterday:y
        })     
        if(this.options.today){
            if(this.options.today==0){
              app.today=0
            }
            this.toD({currentTarget:{id:app.today}})
          
      }
        wx.hideLoading({
          
        })

      })
    }else{
    //非news
    let p=app.setting.pathAca+list+'\/'
    
     for(var i in app.setting.lists[list]){
     
       for(var j in app.setting.lists[list][i]){
        this.data.matIds.push({["m"]:j,["t"]:app.setting.lists[list][i][j],["d"]:'',["path"]:p})
       }
       
     }
     
      this.setData({
        matIds:this.data.matIds,
        matType:list,
        audioPath:app.setting.pathAca+list+'\/'
      })
      wx.hideLoading({
      
      })
      
    }


  },
  word(e){
    let a = this.data.matIds[e.currentTarget.id]
  
  },
  scrollBottom(){
    if(this.options.list=="news"){
      this.data.listCounter++
      this.getContents(this.options.list)
    }
  },
  toV(e){
    wx.navigateTo({
      url: '../webview/webview?m='+this.data.matIds[e.currentTarget.id].m+'&d='+this.data.matIds[e.currentTarget.id].d,
    })  
 
  },
  toPlay(e){
    let that=this

// if(that.data.matType=='news'&&e.currentTarget.id<that.data.yesterday&&!that.data.vip){
//   that.vipBuy()
// return
// }
    if(!this.data.ifPlay){
      //暂停态
      if(this.data.playingID==e.currentTarget.id){
        //恢复态
       
        app.bam.play()
       
      }else{
         //新增或切换  
               
        wx.showLoading({
          title: '加载中',
          icon:'none'
        })
       let c=''
        if(this.data.matType=="news"){
          
          c=this.data.matIds[e.currentTarget.id].path
        }else {
         c=this.data.audioPath
        }
       
    this.setData({
      playingID:e.currentTarget.id,
      audioName:this.data.matIds[e.currentTarget.id].d+' '+this.data.matIds[e.currentTarget.id].t,
      audioSrc:c+this.data.matIds[e.currentTarget.id].m+'.mp3',
      toVideo:true
    })
  
  }
  }else{
    //播放态
    if(this.data.playingID==e.currentTarget.id){
      app.bam.pause()
     
    }else{
      let that=this
      app.bam.onStop(function () {
        that.setData({
          ifPlay:false
        })
        that.toPlay({currentTarget:{id:e.currentTarget.id}})
      })
      app.bam.stop()   
    }
  
  }
  },
  picLoaded(){
    wx.hideLoading({
      success: (res) => {
        wx.showToast({
          title: '轻触图片返回',
          icon:'none'
        })
      },
    })
  },
  toWord(e){
    
    if(!this.data.picShow){
      // if(this.data.matType=='news'&&e.currentTarget.id<this.data.yesterday&&!this.data.vip){
      //   this.vipBuy()
      //   return
      //   }
      let d = this.data.matIds[e.currentTarget.id].d
      var y =d[0]+d[1]
      var m =d[2]+d[3]
      var picPath='cloud://bat.6261-bat-1259770860/bat/20'+y+'.'+m+'\/'
      this.setData({
        wordPic: picPath+this.data.matIds[e.currentTarget.id].m+'.png',
        picShow:!this.data.picShow
       })
       wx.showLoading({
         mask: true,
       })
    
    }else{
      this.setData({
        picShow:!this.data.picShow
       })
    
    }

  },
  toD(e){
    // if(this.data.matType=='news'&&e.currentTarget.id<this.data.yesterday&&!this.data.vip){
    //   this.vipBuy()
    //   return
    //   }
    let that=this
    let current=this.data.matIds[e.currentTarget.id].m
   
    if(app.matHistory[current]==undefined||{}){
      app.matHistory[current]=this.data.matIds[e.currentTarget.id]
    }
   
    wx.navigateTo({
      url: '../dictation/dictation?mode='+app.userData.mode+'&current='+current+'&matType='+that.data.matType,
    })
  },
  chooseMode(e){
    let that=this
    let a =['逐句听写','选词排序']
    wx.showActionSheet({
      alertText:"请选择练习模式",
      itemList: a,
      success (res) {
        if(res.tapIndex==2){
          return
        }
        that.setData({
          modeChosen:a[res.tapIndex]
        })
        app.userData.mode=res.tapIndex
       
        db.collection(app.setting.dbName).doc(app.openid).update({
          data: {  
            mode:app.userData.mode
          }
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  vipBuy(){

    let that=this
      if(app.platform=='ios'&&app.setting.iosBan){
        wx.showModal({
          title: 'ios用户请前往公众号购买终身会员',
          content:'购买后我们会尽快为您开通。'+'\n'+'会员可观看材料原视频，并同时享受公众号终身会员权益'+'\n'+'有疑问欢迎加客服微信，微信号satine_zhang',
       
          success(res){
       
          }
        })
      }else{

      wx.showModal({
        title:'是否购买会员？',
        content:'会员可观看材料原视频，'+'\n'+'并可同时享受公众号终身会员权益'+'\n'+'终身会员价格:198元',
    
        success(res){
         if(res.confirm){
          common.pay(that)          
         }else{
         
         }
        }
      })
      }
    
  },

  refreshed(){
    let that=this
    if(this.data.matType!=news){
      if(!that.data.ifRefresh){
        that.setData({
          ifRefresh:false
        })
      }
      return
    }
      //刷新列表
    db.collection('materials').where({}).orderBy('d','desc').get()
    .then(res=>{
      let first = res.data[0]
      if(first.m!=that.data.matIds[0].m){
        wx.redirectTo({
          url: '../list/list?list='+that.options.list,
        })
      }else{
        wx.showToast({
          title: '列表已刷新',
          icon:'none'
        })
        if(!that.data.ifRefresh){
          that.setData({
            ifRefresh:false
          })
        }
      }
    })
     


  },
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this
   let a = ['逐句听写','选词排序','整段听写（即将上线）']
if(app.userData!=undefined){
  this.setData({
    vip:app.vip,
    modeChosen:a[app.userData.mode],
    totalChecked:app.userData.totalChecked
  })
}else{
  let int=setInterval(() => {
    if(app.userData!=undefined){
      this.setData({
        vip:app.vip,
        modeChosen:a[app.userData.mode],
        totalChecked:app.userData.totalChecked
      })
      clearInterval(int)
    }
  }, 50);
}

    

      //检查是否打卡        
      for(var i in this.data.matIds){
         
        if(app.userData.checkedMaterials.includes(this.data.matIds[i].m)){
          
          this.data.matIds[i].ifChecked=true
          this.setData({
            matIds:this.data.matIds
          })
        }
      }
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
    app.bam.onStop(function () {
  
    })
    app.bam.stop()
    app.bam={}
  
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
  onShareAppMessage: function () {

  },
  
})