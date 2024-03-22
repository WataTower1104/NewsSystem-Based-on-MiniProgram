// pages/my/my.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userName: '',
    avatar: '',
    numofCollections: 0,
    numofHistory: 0,

  },

  

  updateStorage(e){
    let userId = wx.getStorageSync('userId');
    if(userId === '' && e === ''){
      // this.setData({
      //   userId: ''
      // })
      return null;
    }
    else{
      this.setData({
        userId: userId === ''?e.detail:userId
      })
  }
  },

  getNum(){
    // 获取收藏数
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"getCollections",
        userId: this.data.userId
      },
    }).then(result => {
      // console.log(result.result.length);
      this.setData({
        numofCollections: result.result.length
      })
      // 其他操作
    }).catch(error => {
      console.log(error);
      // 其他操作
    })

    // 获取历史数
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"getHistorys",
        userId: this.data.userId
      },
    }).then(result => {
      this.setData({
        numofHistory: result.result.length
      })
      // 其他操作
      console.log('获取历史数')
    }).catch(error => {
      console.log(error);
      // 其他操作
    })
  },

  // 获取用户名
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
      console.log('获取用户名')
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
    this.updateStorage('');
    if(wx.getStorageSync('userId') === ''){
      return null;
    }else{
      this.getNum();
      this.getUserName();
    }
  },

  onShow(){
    if(wx.getStorageSync('userId') === ''){
      return null;
    }else{
      this.getNum();
      this.getUserName();
    }
  }
})