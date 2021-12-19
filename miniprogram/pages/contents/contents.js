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
    let a= setInterval(() => {
      if(app.setting!=undefined){
        this.getContents()
        wx.hideLoading({
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
        clearInterval(a)
      }
      
    }, 500);
   
    // if(that.options.today){
    //   if(app.setting==undefined||app.userData==undefined){
    //     let int = setInterval(() => {
    //       if(app.setting!=undefined&&app.userData!=undefined){
    //         this.getContents("news")
    //         clearInterval(int)
    //       }
    //     }, 50);
    //   }
  
    // }else {
    //   if(app.setting==undefined||app.userData==undefined){
    //     let int = setInterval(() => {
    //       if(app.setting!=undefined&&app.userData!=undefined){
    //         that.getContents(that.options.list)
    //         clearInterval(int)
    //       }
    //     }, 50);
    //   }else{
    //     that.getContents(that.options.list)
    //   }
    // }
 
  

  },
  getContents:function(){
   this.setData({
     matIds: app.setting.tvs
   })
  
    // if(list=="news"){
    //     if(this.data.listCounter==0){
    //       app.bam.epname="一分钟新闻听写"
    //     }
    //     function dateConvert(n){
        
    //       let a = String(n).split('')
    //       var year = '20'+String(a[0])+String(a[1])
    //       var month = String((a[2]=='0')?'':'1')+String(a[3])
    //       var day = String((a[4]=='0')?'':a[4])+String(a[5])
    //       return year+'.'+month+'.'+day
    //     }
    //     function getPath(n) {
    //       let a1= n.substr(0,2)
    //       let a2 = n.substr(2,1)
    //       let a3 = n.substr(3,1)
    //       let b = '20'+a1+'.'
    //       if(a2=='0'){
    //         b=b+a3
    //       }else{
    //         b=b+a2+a3
    //       }

    //       return app.setting.pathA+b+'\/'
    //     }
    //   db.collection('materials').where({}).orderBy('d','desc').skip(this.data.listCounter*20)
    //   .get()
    //   .then(res=>{
    //     let l = this.data.matIds.concat(res.data)       
    //     //转换日期；检查是否打卡       
    //     let y = 1
    //     for(var i in l){          
    //       if(l[i].hour){
    //   let h =(new Date().getTime()-l[i].hour.getTime())/3600000
    //   if(h<22){
    //     l[i].date=Math.ceil(h)+'h ago'
    //     y++
    //   } else{
    //     l[i].date=dateConvert(l[i].d)
    //   }     
    //       }else{
    //         l[i].date=dateConvert(l[i].d)
    //       }          

    //       l[i].path=getPath(l[i].d)
    //       l[i].ifChecked=false
    //       if(app.userData.checkedMaterials.includes(l[i].m)){            
    //         l[i].ifChecked=true           
    //       }
    //       if(this.options.today&&this.options.today!=0){
            
    //         if(l[i].d==this.options.today){
    //           app.today=i
    //         }
          
    //     }
    //     }
    //     this.setData({
    //       matIds:l,
    //       matType:'news',
    //       // yesterday:y
    //     })     
    //     if(this.options.today){
    //         if(this.options.today==0){
    //           app.today=0
    //         }
    //         this.toD({currentTarget:{id:app.today}})
          
    //   }
    //     wx.hideLoading({
          
    //     })

    //   })
    // }else{
    // //非news
    // let p=app.setting.pathAca+list+'\/'
    
    //  for(var i in app.setting.lists[list]){
     
    //    for(var j in app.setting.lists[list][i]){
    //     this.data.matIds.push({["m"]:j,["t"]:app.setting.lists[list][i][j],["d"]:'',["path"]:p})
    //    }
       
    //  }
     
    //   this.setData({
    //     matIds:this.data.matIds,
    //     matType:list,
    //     audioPath:app.setting.pathAca+list+'\/'
    //   })
    //   wx.hideLoading({
      
    //   })
      
    // }


  },
  scrollBottom(){
    if(this.options.list=="news"){
      this.data.listCounter++
      this.getContents(this.options.list)
    }
  },
  toV(e){
    console.log(e)
         wx.navigateTo({
        url: '../video?v='+e.currentTarget.id,
      })
    // wx.navigateTo({
    //   url: '../webview/webview?m='+this.data.matIds[e.currentTarget.id].m+'&d='+this.data.matIds[e.currentTarget.id].d,
    // })  
 
  },

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
  onShareAppMessage: function () {

  },
  
})