// miniprogram/pages/wordDict/wordDict.js
const db = wx.cloud.database()
const _ = db.command
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode:-1,
    word:'',
    ipa:'',
    showipa:false,
    focus:false,
    input:'',
    countdown:15,
    curCount:0,
    tCount:0,
    point:0,
    best:0,
    speaker:'../speaker0.png',
    submitted:false,
    wordHis:[],
    wHis:-1,
    prevWords:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this
    wx.cloud.init({
      env: 'bat'
    })

if(that.data.mode==-1){
  wx.showModal({
    title:'请选择模式：',
    confirmText:'挑战模式',
    cancelText:'练习模式',
    success(res){
      if(res.confirm){
        that.setData({
          mode:0
        })
        that.onLoad()
      }else if(res.cancel){
        that.setData({
          mode:1
        })
        that.onLoad()
      }
    }
  })
}else{
    
    app.iac=wx.createInnerAudioContext()
    
    app.iac.autoplay = true
    app.iac.onPlay(()=>{
      
      wx.hideLoading({
        success: (res) => {},
      })

      clearInterval(app.int)
      let counter=0
      app.int= setInterval(function(){
        if(counter!=3){
          counter++
          that.setData({
            speaker:'../speaker'+counter+'.png'
          })
        }else{
          counter=0
        }
      
      },300)
    })
    app.iac.onEnded(()=>{
      clearInterval(app.int)
      that.setData({
        speaker:'../speaker0.png',
        focus:true
      })
      if(app.word!=that.data.word){
        app.word=that.data.word
        if(that.data.mode==1){return}
        app.cd=setInterval(()=>{
          that.setData({
            countdown:that.data.countdown-1
          })
          if(that.data.countdown==0){
            clearInterval(app.cd)
            if(that.data.point>that.data.best){
              that.setData({
                best:that.data.point
              })
              //update best
            }
            that.setData({
              focus:false
            })
              wx.showModal({
                title:'答题时间到。正确答案为：',
                content:that.data.word+' '+that.data.ipa,
                cancelText:'重新开始',
                confirmText:'确定',
                success(res){
                  if(res.confirm){
                    that.setData({
                      submitted:true,
                      wHis:that.data.wHis+1,
                      focus:false,
                      prevWords:that.data.wordHis[that.data.wHis+1]
                    })
                    return
                  }
                that.setData({
                  countdown:15,
                  point:0,
                  curCount:0,
                  submitted:true,
                  input:that.data.word,
                  wHis:that.data.wHis+1
                })
                that.reset()
                }
              })           
          }
        },1000)
      }
    })
    that.setData({
      tCount:app.userData.tCount,
      best:app.userData.best
    })
    that.reset()    
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
  read(){
    app.iac.play()
  },
  submit(e){
    let that=this
   //发现同音异形词后默认用户输入正确
   if(app.wordSet.includes(e.detail.value.textarea)){
    that.data.wordHis.pop()
    that.data.wordHis.push(e.detail.value.textarea)
     that.setData({
        word:e.detail.value.textarea
     })
    //  console.log(that.data.word)
   }
   if(that.data.submitted){
    that.reset()
    that.setData({
      point:0,
      curCount:0,
      wHis:that.data.wHis+1,
      prevWords: that.data.wordHis[that.data.wordHis.length-1],
      wordHis:that.data.wordHis 
    })
    return
  }
    if(e.detail.value.textarea==that.data.word){
      const db = wx.cloud.database()
      const _ = db.command
      clearInterval(app.cd)
      wx.showToast({
        title: '回答正确',
        icon: 'success',
        duration:1000,
        mask:'true',
        success: (res) => {
          setTimeout(()=>{that.reset()},1000)
          },
        fail: (res) => {},
        complete: (res) => {},
      })
      if(that.data.mode==1){
        that.setData({
          wHis:that.data.wHis+1,
          prevWords: that.data.wordHis[that.data.wordHis.length-1]
        })
        return
      }
      that.setData({
        curCount:that.data.curCount+1,
        tCount:that.data.tCount+1,
        point:that.data.point+that.data.word.length,
        wHis:that.data.wHis+1,
        prevWords: that.data.wordHis[that.data.wordHis.length-1]
      })
      app.userData.tCount=that.data.tCount
      if(that.data.point>that.data.best){
        that.setData({
          best:that.data.point
        })
        app.userData.best=that.data.best
      }
      db.collection(app.setting.dbName).doc(app.openid).update({
        data: {
          tCount:that.data.tCount,
          best:that.data.best
        },
        success(){console.log('userDataUpdated')}
      })
    }else{
      wx.vibrateLong({
        success: (res) => {},
      })


      if(that.data.mode==1){

        wx.showModal({
          title: '回答错误，是否查看答案？',
          cancelText:'再试试',
          confirmText:'看答案',
          success(res){
            if(res.confirm){
              wx.showModal({
                title:'正确答案为：',
                content:that.data.word+' '+that.data.ipa,
                showCancel:false,
                success(){
                  that.setData({
                    submitted:true,
                    wHis:that.data.wHis+1,
                    focus:false,
                    prevWords:that.data.wordHis[that.data.wHis+1]
                  })

                }
              })
            }else if(res.cancel){
              that.play()
              that.setData({
                focus:true,        
              })
            }
          }
        })
        return
      }else{
        that.setData({
          focus:true,        
        })
        that.play()
      }
      if(that.data.point>0){
        that.setData({
          point:Math.floor(that.data.point/2)
        })
      }else{
        that.setData({
          point:0
        })
      }


    }
  },
  play(){
    app.iac.pause()
    app.iac.seek(0)
    app.iac.play()
  },
  tapWord(){
    wx.setClipboardData({
      data: this.data.prevWords,
    })
  },
  wordBack(){
    if(this.data.wHis>0){
      this.setData({
        wHis:this.data.wHis-1,
        prevWords:this.data.wordHis[this.data.wHis-1],
        wordHis:this.data.wordHis
      })
    }
  },
  wordForward(){
    if(this.data.wHis<this.data.wordHis.length-2||((this.data.wHis<this.data.wordHis.length-1)&&this.data.submitted)){
      this.setData({
        wHis:this.data.wHis+1,
        prevWords:this.data.wordHis[this.data.wHis+1]
      })
    }
  },
  reset(){
    let that=this
    wx.showLoading({
      title: '单词即将播放',
      mask:'true'
    })
    if(that.data.mode==1){
      that.setData({
        showipa:true
      })
    }     
         // 加载ipa
         wx.cloud.getTempFileURL({
          fileList: ['cloud://bat.6261-bat-1259770860/ipa_revised.txt','cloud://bat.6261-bat-1259770860/ipa_audio_overlap.txt'],
          success: res => {
            wx.request({
              url: res.fileList[1].tempFileURL,
              header:{
                'content-type': 'text'
              },
              success:res=>{
                
               let array = res.data.split('\n')
                               
                 let index=Math.floor(Math.random()*array.length)
                let t= array[index].split('\t')
              that.data.wordHis.push(t[0])
                 that.setData({
                   word:t[0],
                   ipa:t[1],
                   input:'',
                   countdown:15,
                   submitted:false,
                   focus:true               
                 })
                 if(that.data.mode!=1){
                  
                   that.setData({
                     showipa:false
                   })                
                 }
               
                 if(app.setting.ol[that.data.ipa]){
                   //同音异形词
                  app.wordSet= app.setting.ol[that.data.ipa]
                 }else{
                  app.wordSet=[]
                 }              
                 app.iac.src ='cloud://bat.6261-bat-1259770860/wordAudio/'+that.data.word+'.mp3'                 
                 
              }
            })
        
            wx.request({
              url: res.fileList[0].tempFileURL,
              header:{
                'content-type': 'text'
              },
              success:res=>{
                app.ipa=res.data
              }})}})
    
   
   
  },
  ifipa(){
    this.setData({
      showipa:!this.data.showipa,
      focus:true
    })
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
    app.iac.stop()
    app.iac.destroy()
    app.iac=undefined
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

  }
})