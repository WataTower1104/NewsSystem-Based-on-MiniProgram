// pages/my/mypublic/mypublic.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:'',
    userName:'',
    avatar:'',
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
    let userId = this.data.userId;
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
    let userId = this.data.userId;
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

  getUserName(){
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"getUserInfo",
        userId: this.data.userId
      }
      }).then(result => {
        this.setData({
          userName: result.result._userName,
          avatar: result.result._avatar
      })
      // 其他操作
      }).catch(error => {
        console.log(error);
      // 其他操作
      })
  },

  onLoad(options) {
    this.setData({
      userId: options.id,
    });
    this.getUserName();
    this.getNewsPublished();
    this.getVideoPublished();
  },
})