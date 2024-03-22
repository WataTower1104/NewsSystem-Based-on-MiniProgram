// pages/functionTest/functionTest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: '',
    comments: [{
      _userId: '333',
      _content: 'asdasd'
    }],
    briefs: []
  },

  getVideos(){
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"getUserInfo",
      userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A'
      },
    }).then(res => {
      console.log(res);
    })
  },

  getComment() {
    let that = this;
    wx.cloud.callFunction({
      name: 'commentHandle',
      data: {
        action: 'getComments',
        newsId: '123465',
        page: 0,
        num: 1
      }
    }).then(res => {
      console.log(res);
      that.setData({
        comments: that.data.comments.concat(res.result.data)
      })
      console.log(that.data.comments);

    })
  },

  onInputChange() {
    /*
      用于消除双向绑定警告
      Do not have handler in component: pages/functionTest/functionTest. Please make sure that  handler has been defined in pages/functionTest/functionTest.
    */
  },

  async postComment() {
    try {
      let that = this;

      // 获取用户 OpenID
      let { result } = await wx.cloud.callFunction({
        name: 'getOpenid',
      });
      let userId = result.openid;

      // 调用云函数提交评论
      let res = await wx.cloud.callFunction({
        name: 'commentHandle',
        data: {
          action:'postComment',
          content: that.data.comment,
          newsId: '123465',
          time: this.getFormatTime(),
          userId: userId,
        }
      });
      // 处理提交结果
      console.log(res);
      // 其他操作...

    } catch (err) {
      // 处理错误信息
      console.error(err);
      // 其他操作...
    }
  },

  getNewsDetail() {
    wx.cloud.callFunction({
      name: 'newsHandle',
      data: {
        newsId: 'da2c5dc56468c6e7000c6c832f7b5aea',
        action: 'getDetail'
      },
    }).then(res => {
      // 处理返回的数据
      console.log(res); 
      // 其他操作
    }).catch(error => {
      console.log('get fail', error);
      // 其他操作
    });

  },

  getNews() {
    let that = this;
    wx.cloud.callFunction({
      name: 'newsHandle',
      data: {
        action: 'getBriefs',
        page: 0,
        num: 5
      },
    }).then(res => {
      // 处理返回的数据
      console.log(res); 
      that.setData({
        briefs: that.data.briefs.concat(res.result.data)
      })
      // 其他操作
    }).catch(error => {
      console.log('get fail', error);
      // 其他操作
    });
  },

  getEvent(e) {
    let id = e.currentTarget.dataset.index
    console.log(id)
    console.log(this.data.briefs[id]._id);
  },

  // 获得yyyy-mm-dd hh:mm:ss格式的时间
  getFormatTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = this.formatNumber(now.getMonth() + 1);
    let day = this.formatNumber(now.getDate());
    let hour = this.formatNumber(now.getHours());
    let minute = this.formatNumber(now.getMinutes());
    let second = this.formatNumber(now.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  },

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