// pages/reading/reading.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    a:'',
    wc:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   let that=this
    wx.cloud.getTempFileURL({
      fileList: ['cloud://bat.6261-bat-1259770860/articles/a.txt'],
      success: res => {
       
        wx.request({
          url: res.fileList[0].tempFileURL,
          success(res){
            app.a=res.data
            var array = app.a.split('\n')
            var length=0
         
            for(var i in array){
             length=length+array[i].split(' ').length
            }
            that.setData({
              a:app.a,
              wc:length
            })

          }
        })
      }
    })
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