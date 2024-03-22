// pages/myHistory/myHistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history:[],
  },
    //获取历史数据
    getHistory(){
      var that = this;
      let userId = wx.getStorageSync('userId');
    wx.cloud.callFunction({
        name: "userHandle",
        data: {
          action:"getHistorys",
          userId: userId
        },
      }).then(result => {
        console.log(result.result);
        that.setData({
          history: result.result
        })
        // 其他操作
      }).catch(error => {
        console.log(error);
        // 其他操作
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHistory()
  },
})