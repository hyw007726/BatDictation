// miniprogram/pages/webview/webview.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.cloud.getTempFileURL({
    //   fileList: ['cloud://bat.6261-bat-1259770860/bat/2021.6/g7_global_tax.mp4'],
    //   success: res => {

    //   },
    //   fail: console.error
    // })
console.log(options)
if(options.url!=undefined){
  this.setData({
    src:options.url
  })
}else{


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
      
      return "https://6261-bat-1259770860.tcb.qcloud.la/bat/"+b+'\/'
    }
   
    this.setData({
      // src:options.s!='undefined'?options.s:('https://wx.batenglish.cn/'+options.m+'.mp4')
      src: getPath(options.d)+options.m+'.mp4'
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
  onShareAppMessage: function () {

  }
})