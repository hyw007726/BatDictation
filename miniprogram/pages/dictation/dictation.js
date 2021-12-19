// miniprogram/pages/dictation/dictation.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command


Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode:1,
    picShow:false,
    loop:false,
    slow:false,
    wordSet: [],
    rightSet: [],
    chosenSet: [],
    vPicSrc:'',
    titleV: '-',
    played: false,
    canIUse: true,
    ifPlay: true,
    finSen:false,
    order: '',
    senTotal: 0,
    currentSen: 0,
    beginPoint: 0,
    currentSenDur: 0,
    txtSet: {},
    transSet: [],
    currentAns: '',
    currentText:'',
    checked: false,
    rawData: {},
    curData: {},
    timeSet: [],
    currentSetN: [],
    currentSetR: [],
    isVip: false,
    speaker: '../speaker0.png',
    iosDelay: 500,
    wrongIndex: -1,
    submitted:false,
    input:0,
    anno:'',
    focus:false,
    rightWords:0,
    rightAnsLength:0,
    currentTrans:'',
    latest:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
    wx.showLoading({
      title: '加载音频中',
      mask: true
    })
  
    let that = this
    
 
     
    if (app.matHistory[options.current].curSen==undefined) {
      app.matHistory[options.current].curSen=0
    }
    if (app.matHistory[options.current].input==undefined) {
      app.matHistory[options.current].input={}
    }
    this.setData({
        currentSen: app.matHistory[that.options.current].curSen,
        loop:app.userData.loop,
        mode:app.userData.mode,
        titleV: app.matHistory[that.options.current].t
      })
  
    if(this.options.matType=='news'){
      this.setData({
        vPicSrc:app.matHistory[that.options.current].path+app.matHistory[that.options.current].m+'.png'
      })
    }
     
    var a = app.matHistory[that.options.current].path + app.matHistory[that.options.current].m+ ".txt"


    wx.cloud.getTempFileURL({
      fileList: [a],
      success: res => {
        wx.request({
          url: res.fileList[0].tempFileURL,
          data: {},
          header: {
            'content-type': 'text'
          },
          success: function (res) {
            
            let r = res.data.split(/\n/g)
        
            let a = []
            let b = []
            let c = []
            let t =3
           
            if(r[0].split(/\t/)[1]==''){
              t=2
            }
            for (let i in r) {
              a.push(r[i].split(/\t/)[0]) // 时间点数组      
              b.push(r[i].split(/\t/)[1]) // 文本数组    
              c.push(r[i].split(/\t/)[t]) // 翻译数组 
            }

            if (b[0] != "") {
              b.pop()
              c.pop()
            } else {
              b.shift()
              c.shift()
            }
            console.log(a, b, c)
            //转换时间
            var tt = []

            if (app.platform == 'ios') {
              that.setData({
                iosDelay: 0
              })
            }
            for (var i = 0; i < a.length; i++) {
              tt.push(Number(a[i].substring(4, 5)) * 60 * 1000 + Number(a[i].substring(6, 9)) * 1000 + Number(a[i].substring(9, 12)))
            }
            // console.log(tt)
            // tt[0]=0
            a = tt

            that.setData({
              timeSet: a,
              txtSet: b,
              senTotal: b.length,
              transSet: c
            })    
          
            that.selectSen(that.data.currentSen,true)
          }
        })
      }
    })
  
  },

  
  selectSen(index,change) {
    let that = this
    clearTimeout(app.t)
    app.t=undefined
    if(!change){
      app.iac.seek(that.data.beginPoint / 1000)
        app.iac.play()    
        return
    }
   
    let bgTime = this.data.timeSet[index]
    let curDur = this.data.timeSet[index+1] - this.data.timeSet[index]
    let curAns = String(this.data.txtSet[index]).trim()   
    let asterisk = curAns.search(/\*/)
    if (asterisk != -1){     
      that.setData({
        anno:curAns.substring(asterisk)
      })
      curAns=curAns.substring(0, asterisk)
    }
   
    let curSet = curAns.split(/\s/) //第index句顺序文本数组
    for (var i in curSet) {
      that.data.rightSet.push(curSet[i])
      that.data.chosenSet.push(1)
    }
    // 第index句乱序文本数组（sort方法会直接改变调用者）
    let cR = curAns.split(/\s/)
    let rand = cR.sort(function (a, b) {
      return Math.random() > .5 ? -1 : 1;
    }) 
    //起始句数据
    that.setData({
      currentSetN: curSet,
      currentSetR: rand,
      beginPoint: bgTime,
      currentSenDur: curDur,
      currentAns: curAns,
      order: "第" + (index+1) + "/" + that.data.senTotal + "句",
      currentTrans:that.data.transSet[that.data.currentSen]
    })
   
  
    if (app.iac==undefined) {
      const iac = wx.createInnerAudioContext()
      iac.autoplay = true
     
      //bug:autoplay为false时无法播放，音频头部必须播放出来
      app.iac = iac
      that.audioControl()
      
      iac.src = app.matHistory[that.options.current].path + app.matHistory[that.options.current].m + '.mp3'
      if (that.data.currentSen > 0) {
        that.selectSen(that.data.currentSen,true)
        
      }
 
    } else {
      //非初始状态
   
      // that.audioControl()
      app.iac.seek(that.data.beginPoint / 1000)
        app.iac.play()
      
      
    }

  },
  audioControl() {
    let that = this
    app.iac.onEnded(function () {
      clearTimeout(app.t)
     app.t=undefined
      clearInterval(app.int)
      that.setData({
        ifPlay: false,
        played: true,
      })
      app.iac.seek(that.data.beginPoint / 1000)
    })
   
    app.iac.onPause(function () {
      clearTimeout(app.t)
      app.t=undefined
      clearInterval(app.int)
      that.setData({
        played: true,
      })
    })
   
    app.iac.onPlay(function () {
     
      wx.hideLoading({
        success: (res) => {
        },
      })
  
      that.setData({
        played: true,
        ifPlay:true
      })
      if(!that.data.submitted){
        that.setData({
          focus:true
        })
      }
      clearInterval(app.int)
      let counter = 0
      app.int = setInterval(function () {
        if (counter != 3) {
          counter++
          that.setData({
            speaker: '../speaker' + counter + '.png'
          })
        } else {
          counter = 0
        }

      }, 300)

      let original = that.data.timeSet[that.data.currentSen+1] - that.data.timeSet[that.data.currentSen]
      if(that.data.slow){
        app.iac.playbackRate=0.5
        that.data.currentSenDur=original*2
      }else{
        app.iac.playbackRate=1
        that.data.currentSenDur = original
      }
    if(app.t!=undefined){
      return
    }
    app.t = setTimeout(function () {
        
        if(that.data.loop){
          app.iac.pause()
          app.iac.seek(that.data.beginPoint/1000)
            app.iac.play()
          
        }else{
          app.iac.pause()  
          that.setData({
            ifPlay:false
          })      
        }
       
      }, that.data.currentSenDur)
     
    })

  },
  showVocab(e){
   
    if(!this.data.picShow){
      wx.showLoading({
        mask:true
      })
      if(this.data.ifPlay){
        this.playOrPause()
      }
      this.setData({
        picShow:true,
        focus:false
      })
    }else{
      this.setData({
        picShow:false
      })
    }

  },
  picLoaded(){
   
    wx.hideLoading({
      success(){
        wx.showToast({
          title: '轻触图片可返回',
          icon:'none'
        })
      }
    })
  },
 
  correct(e){
    let that =this
    if(this.data.mode==0){
      this.setData({
        submitted:false,
        finSen:false
      })
      setTimeout(() => {
        that.setData({
          focus:true
        })
      }, 100);
       
      
    
    }

  },
  input(e){
      
      app.matHistory[this.options.current].input['s'+this.data.currentSen]=e.detail.value

  },
  nextSen(){
  
    let that=this
    if(this.data.slow){
      this.setData({
        slow:false
      })
      app.iac.playbackRate=1
    }
    if(this.data.mode==0){
    if(!this.data.submitted){
      //提交   
      let his = app.matHistory[this.options.current].input['s'+this.data.currentSen]
      if(his==undefined){
        his=''
      }
      this.setData({
        submitted:true,
        finSen:true,
        focus:false, 
        currentText:his      
      })
      if(this.data.senTotal==this.data.currentSen+1){
        if(app.userData.checkedMaterials.includes(this.options.current)){
          return
        }
        //完成打卡
        wx.showToast({
          title: '恭喜您完成打卡',
        })
        
        app.userData.checkedMaterials.push(this.options.current)
        app.userData.totalChecked++
        db.collection(app.setting.dbName).doc(app.openid).update({
          data: {  
            checkedMaterials:_.addToSet(that.options.current),
            totalChecked:_.inc(1)
          }
        })
      }      
      this.rate()
    }else{
//提交后的下一句

      if(this.data.senTotal==this.data.currentSen+1){
        //最后一句
        wx.showModal({
          title: '是否重新开始？',
          content:'重新开始将清空已输入内容',
          success(res){
            if(res.confirm){
              app.matHistory[that.options.current].input = {}
              that.setData({
                currentSen:0,
                submitted:false, 
                currentText:'',
                finSen:false,
                focus:true               
              })
              that.selectSen(0,true)
            }
          }
        })
      }else{
        this.setData({
          currentSen:this.data.currentSen+1,       
        })
        wx.showLoading({
          mask: true,
        })
        app.iac.pause()
      //下一句（旧）
       let his = app.matHistory[this.options.current].input['s'+this.data.currentSen]        
       if(his!=undefined){
        this.setData({
          submitted:true,
          currentText:his,
          finSen:true,
          anno:'',
          focus:false
        })
       
        this.selectSen(this.data.currentSen,true)
        this.rate()
       }else{
        //下一句（新）
        this.setData({
          rightWords:0,
          rightAnsLength:0,
          currentText:'',
          submitted:false,
          finSen:false,
          focus:true
        })
    
       this.selectSen(this.data.currentSen,true)
       }
    
       

      }
  
    }
   
    }else if(this.data.mode==1){
    
      //最后一句
      if(this.data.senTotal==this.data.currentSen+1){
        //最后一句没选完
        if(!this.data.finSen){
          wx.showModal({
            title: '您还未完成打卡，是否重新开始？',
            success(res){
              if(res.confirm){
                that.setData({
                  currentSen:0, 
                  chosenSet:[],
                  wordSet:[], 
                  rightSet:[],
                  wrongIndex:-1    
                })
                that.selectSen(that.data.currentSen,true)
                that.setData({
                  finSen:false,
                  latest:-1           
                })
              }
            }
          })
        }else{
          //最后一句已选完
          wx.showModal({
            title: '是否回到首句？',
            success(res){
              if(res.confirm){
                that.setData({
                  currentSen:0, 
                  chosenSet:[],
                  wordSet:[], 
                  rightSet:[],
                  wrongIndex:-1    
                })
                that.selectSen(that.data.currentSen,true)
                that.setData({
                  finSen:false,
                  latest:-1            
                })
              }
            }
          })
        }       
      }
      //非最后一句
      else{    
      if(!this.data.finSen){
        wx.showModal({
          title: '本句未结束，是否切换下一句？',
          content:'完成本句后可以看到参考翻译哦～',
          success(res){
            if(res.confirm){
              that.data.finSen=true
              that.nextSen()
            }
          }
        })
      }else{
         //选完后进入下一句
         this.setData({
          currentSen:this.data.currentSen+1, 
          chosenSet:[],
          wordSet:[], 
          rightSet:[],
          wrongIndex:-1    
        })
        this.selectSen(this.data.currentSen,true)
          
      }
      this.setData({
        finSen:this.data.latest>=this.data.currentSen            
      })
    }   
  }
  },
  rate(){
    let his = app.matHistory[this.options.current].input['s'+this.data.currentSen]
    if(his==undefined){
      his=''
    }
    //去大小写、标点       
        let toSpace=['. ', ', ',': ', '... ','?', ';','!','-']
        let str1=his.toLowerCase().replaceAll(/[’]/g, "\'").concat(' ')
        let str2=this.data.currentAns.toLowerCase().replaceAll(/[’]/g, "\'").concat(' ')

        for(var i in toSpace){
          str1=str1.replaceAll(toSpace[i], " ")
          str2=str2.replaceAll(toSpace[i], " ")
        }
        
        let a = str1.replaceAll(/\s{2}/g, " ").trim().split(" ")
        let b = str2.replaceAll(/\s{2}/g, " ").trim().split(" ")
      
        this.data.rightWords=0
        for (var i=0;i<a.length;i++){
          let index=b.indexOf(a[i])
          if(index!=-1){
            //找到单词，单词位置index离正确位置不远
            if(Math.abs(index-i)<3){
              this.data.rightWords++
            }
          }}
        this.setData({
          rightWords:this.data.rightWords,
          rightAnsLength:b.length-1,
        })
  },
  prevSen(){
   wx.showLoading({
     mask: true,
   })
    let that=this
    if(this.data.slow){
      this.setData({
        slow:false
      })
      app.iac.playbackRate=1
    }
 
    if(this.data.mode==0){    
      this.data.currentSen=this.data.currentSen-1
    let his = app.matHistory[this.options.current].input['s'+this.data.currentSen]  
    if(his==undefined){
      his=''
    }    
        this.setData({
          currentText:his,
          submitted:true,
          anno:'',
          finSen:true,
        })
        app.iac.pause()
        this.selectSen(this.data.currentSen,true)
        this.rate()

    }else if(this.data.mode==1){

      this.setData({
        currentSen:this.data.currentSen-1,
        chosenSet:[],
          wordSet:[], 
          rightSet:[],
          wrongIndex:-1
      })
      app.iac.pause()
      this.selectSen(this.data.currentSen,true)
     
      this.setData({
        finSen:this.data.latest>=this.data.currentSen            
      })
    }
  },

  playOrPause(){
    
    if(!this.data.ifPlay){
      wx.showLoading({
        mask: true,
      })
      this.selectSen(this.data.currentSen,false)
    }else{
    
      app.iac.pause()
      this.setData({
        ifPlay:false
      })  
    }
  },
  loopSwitch(){
   
    app.iac.pause()
    this.setData({
      ifPlay:false
    })  
    if(this.data.ifPlay){
      this.selectSen(this.data.currentSen,false)
    }
    this.setData({
      loop:!this.data.loop
    })
    app.userData.loop=this.data.loop
    db.collection(app.setting.dbName).doc(app.openid).update({
      data: {  
        loop:app.userData.loop
      }
    })
  },

  slowSwitch(){

   
    this.setData({
      slow:!this.data.slow,
      ifPlay:false
    })
    app.iac.playbackRate=this.data.slow?0.5:1
    app.iac.pause()
  
 
  },
  tapWord: function (e) {
    //本句已选完
    if (this.data.finSen) {
      return
    }
    let that = this
    //选对的情况
    if (this.data.currentSetR[e.target.id] == this.data.rightSet[this.data.wordSet.length]) {
      wx.vibrateShort({
        type: 'light',
      })
      this.data.wordSet.push(this.data.currentSetR[e.target.id])
      // this.data.currentSetR.splice(e.target.id,1)
      this.setData({
        ['chosenSet[' + e.target.id + ']']: 0.5,
        wordSet: this.data.wordSet,
        // currentSetR: this.data.currentSetR,
        wrongIndex: -1,
      })
      
      //选完一句
      if (this.data.currentSetR.length == this.data.wordSet.length) {
       this.data.latest=this.data.currentSen
        //选完最后一句
        if (this.data.currentSen+1 == this.data.senTotal) {         
          if(!app.userData.checkedMaterials.includes(this.options.current)){          
          wx.showToast({
            title: '恭喜您完成当前练习!',
            icon: 'none',
            duration: 3000
          })

          app.userData.checkedMaterials.push(this.options.current)
          app.userData.totalChecked++
          db.collection(app.setting.dbName).doc(app.openid).update({
            data: {  
              checkedMaterials:_.addToSet(that.options.current),
              totalChecked:_.inc(1)
            }
          })
        }}
        
        this.setData({
          finSen: true
        })
      }

    } 
    //选错的情况
    else {
      //点选已选单词
      if (this.data.wordSet.includes(this.data.currentSetR[e.target.id])) {
        if (this.data.chosenSet[e.target.id] == 0.5) {
          return
        }
      }
      wx.vibrateShort({
        type: 'heavy',
      })
      this.setData({
        wrongIndex: e.target.id
      })      

    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    

    // const query = wx.createSelectorQuery()
    // query.select('#upper').boundingClientRect(function name(rect) {
 
    //   // for(var i in rect){
    //   //   console.log(rect[i].id,rect[i].bottom)
    //   // }     
    // }).exec()
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
    app.matHistory[this.options.current].curSen=this.data.currentSen
    clearTimeout(app.t)
   app.t=undefined
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