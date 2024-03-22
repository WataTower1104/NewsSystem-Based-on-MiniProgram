// pages/my/mypublic/mypublic.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    currentTab: 0,
    myNewsPublished: '',
    myVideoPublished: '',
    height: 0,
    select: 0,
  },

  switchNav: function (e) {
    var id = e.target.id;
    if (this.data.currentTab == id) {
      return false;
    } else {
      this.setData({
        currentTab: id,
      });
    }
    this.setData({
      active: id,
      select: e.currentTarget.id
    });
    // console.log(this.data.select)
    this.watchHeight();

  },

  // 滑动swiper
  activeSw(e) {
    var index = e.detail.current
    this.setData({
      select: index,
      active: index,
    });
    this.watchHeight();
  },

  getNewsPublished() {
    let userId = wx.getStorageSync('userId');
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action: "getNewsPublished",
        userId: userId,
      }
    }).then(result => {
      console.log(result.result);
      // 其他操作
      this.setData({
        myNewsPublished: result.result
      });
    this.watchHeight();
    // console.log(this.data.myNewsPublished);
    }).catch(error => {
      console.log(error);
      // 其他操作
    })
  },

  getVideoPublished() {
    let userId = wx.getStorageSync('userId');
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action: "getVideoPublished",
        userId: userId,
      }
    }).then(result => {
      console.log(result.result);
      // 其他操作
      this.setData({
        myVideoPublished: result.result
      });
    this.watchHeight();
  }).catch(error => {
      console.log(error);
      // 其他操作
    })
  },

  watchHeight() {
    var query = wx.createSelectorQuery()
    var box = '.box' + this.data.select
    var phoneHeight = wx.getSystemInfoSync().windowHeight;
    // console.log(box)
    query.select(box).boundingClientRect((res) => {//实时刷新box高度
      this.setData({
        height: parseInt(res.height)>phoneHeight?parseInt(res.height):phoneHeight
      })
      // console.log("watchHeight: " + wx.getSystemInfoSync().windowHeight)
    }).exec()
  },

  noMove(e) {
    // 空方法，用于消除警告
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.watchHeight();
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
    this.getNewsPublished();
    this.getVideoPublished();
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