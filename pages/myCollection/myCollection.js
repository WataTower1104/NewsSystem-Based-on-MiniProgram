// pages/myCollection/myCollection.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collection:[]
  },

    //获取收藏数据
    getCollection(){
      var that = this;
      let userId = wx.getStorageSync('userId');
      wx.cloud.callFunction({
        name: "userHandle",
        data: {
          action:"getCollections",
        userId: userId
        },
      }).then(result => {
        console.log(result.result);
        that.setData({
          collection: result.result
                })
        // 其他操作
      }).catch(error => {
        console.log(error);
        // 其他操作
      })
  },

    // getComments(){
    //   var that = this;
    //   wx.cloud.callFunction({
    //     name:"getCollection",
    //     data:{
    //       userId:wx.getStorageSync('userId')
    //     },
    //     success: (res) => {
    //       that.setData({
    //         collection: res.result.list[0].TianWenGe
    //       })
    //     }
    //   })
    // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getCollection()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})