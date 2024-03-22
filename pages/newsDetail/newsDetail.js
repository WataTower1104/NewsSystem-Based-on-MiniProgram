// index.js

// const { resolve } = require("url");

// 获取应用实例
const app = getApp()
// index.js
Page({
  data: {
    id: '',
    total:0,
    page:0,
    isCollected:0,
    newsContent: {
      id: '',
      title: '',
      source: '',
      date: '',
      describe: '',
      userId: '',
      userName: '',
    },
    comments: [],
    inputComment: '',
    textareaHeight: 40,
    textLineCount: 1,
    scrollable: false,
    maxLength: 200,
    disableSubmit: true
  },
  onLoad: function (options) {
    this.setData({
      id: options.id,
      options: options,
      isCollected:options.isCollected
    })
    this.addHistory()
    this.freshPage();
  },
  onShareAppMessage: function (res) {
    var that = this;
    var id = that.data.id;
    //如果用户是点击按钮进行分享的
    if (res.from == 'button') {
      return {
        title: that.data.newsContent.title, //分享出去的标题
        imageUrl: that.data.imgUrl, //分享时显示的图片
        path: '/pages/newsDetail/newsDetail?id=' + id, //别人点击链接进来的页面及传递的参数
      }
    } else {
      return {
        title: that.data.newsContent.title, //分享出去的标题
        imageUrl: that.data.imgUrl, //分享时显示的图片
        path: '/pages/newsDetail/newsDetail?id=' + id, //别人点击链接进来的页面及传递的参数
      }
    }
  },

  addHistory(){
    var userId = wx.getStorageSync('userId')
    var date = this.getFormatTime()
    var that = this
    if (userId === ''){
      return;
    }
    wx.cloud.callFunction({
      name: "userHandle",
      data: {
        action:"addHistory",
        userId:userId,
        date:date,
        newsId:that.data.id
      },
      }).then(result => {
        console.log(result);
      // 其他操作
      }).catch(error => {
        console.log(error);
      // 其他操作
      })
  },
  onInput(e) {
    let value = e.detail.value;
    let lines = this.data.textLineCount;

    let height = lines > 5 ? 5 * 40 : lines * 40;
    let scrollable = lines > 5;

    this.setData({
      inputComment: value,
      textareaHeight: height,
      scrollable: scrollable,
      disableSubmit: value.trim().length === 0
    });
  },

  isMaxHeight(e) {
    this.setData({
      textLineCount: e.detail.lineCount
    })
  },
  getCollection(){
    var userId = wx.getStorageSync('userId')
    var that = this
    if (userId === ''){
      return;
    }
    wx.cloud.callFunction({//获取用户所有收藏
      name: "userHandle",
      data: {
      action:"getCollections",
      userId: userId
      },
    }).then(result => {
      // 其他操作
      let flag = 0
      for(let i = 0;i < result.result.length;i++){
        if(result.result[i]._newsId==that.data.id){
          that.data.isCollected = 1
          flag = 1
        }
      }
      if(flag == 0){
        that.data.isCollected = 0
      }
      console.log("flag"+flag)
    }).catch(error => {
      console.log(error);
      // 其他操作
    })
  },
  collection(){
    var userId = wx.getStorageSync('userId')
    var that = this
    if (userId === ''){
      wx.showToast({
        title: "尚未登录！",
        icon: 'error'
      })
      return;
    }
    var date = this.getFormatTime()
    if(that.data.isCollected == 0){//未被收藏则添加收藏
      wx.cloud.callFunction({
      name: "userHandle",
      data: {
      action:"addCollection",
      userId:userId,
      newsId:that.data.id,
      date:date
      },
      }).then(result => {
        // console.log(result);
        // 其他操作
        wx.showToast({
          title: "收藏成功！",
          icon: 'success'
        })
        that.setData({
          isCollected : 1
        })
      }).catch(error => {
      // console.log(error);
      // 其他操作
      })
    }else{
      wx.cloud.callFunction({
        name: "userHandle",
        data: {
        action:"removeCollection",
        userId:userId,
        newsId:that.data.id,
        },
        }).then(result => {
          // console.log(result);
          // 其他操作
          wx.showToast({
            title: "取消收藏！",
            icon: 'error'
          })
          that.setData({
            isCollected : 0
          })
        }).catch(error => {
        // console.log(error);
        // 其他操作
        })
    }
    
  },
  async onSubmit() {
    var userId = wx.getStorageSync('userId')
    var that = this
    if (userId === ''){
      wx.showToast({
        title: "尚未登录！",
        icon: 'error'
      })
      return;
    }
    try {
      let content = this.data.inputComment;
      //用户评论输入内容为空时弹出  
      if (content == '') {   
        wx.showToast({
          title: '请输入内容', //提示内容       
          icon: 'none'
        })
        return {
          errCode:-1,
          msg:'输入为空'
        };
      }else if(content.length <= 1){
        wx.showToast({
          title: '输入字数过少', //提示内容       
          icon: 'none'
        })
        return {
          errCode:-1,
          msg:'字数过少'
        };
      }
      
      //当前时间   
      let time = this.getFormatTime(); 
      let that = this;
      
      // 获取用户 ID
      var userId = wx.getStorageSync('userId')

      // 调用云函数提交评论
      let res = await wx.cloud.callFunction({
        name: 'commentHandle',
        data: {
          action: 'postComment',
          content: content,
          newsId: that.data.id,
          date: time,
          userId: userId,
        }
      });
      // 处理提交结果
      console.log("提交结果=>>");
      console.log(res)
      // that.getComment();
      
      // 其他操作...
      that.setData({
        inputComment: '',
        textareaHeight: 40,
        scrollable: false,
        disableSubmit: true
      })
      that.freshPage()

    } catch (err) {
      console.error("提交报错" + err);
    }
  },
  getTotal(){
    var that = this
    wx.cloud.database().collection('comments-table').where({
      _newsId:this.data.id
    })
    //查询操作
    .get({
      //请求成功
      success(res){
        that.setData({
          total:res.data.length
        })
      },
      //请求失败
      fail(err){
        // console.log('请求失败',err)
      }
    })
  },
  freshPage() {
    this.setData({
      page:0,
      comments:[],
      flag:0
    })
    this.getData();
    console.log("freshPage getComment")
    this.getComment();
  },
  // 监听for高度,增加高度
  watchHeight() {
    var query = wx.createSelectorQuery()
    query.select('.comments').boundingClientRect((res) => {//实时刷新box高度
      this.setData({
        height: parseInt(res.height)
      })
      // console.log(res.height)
    }).exec()
  },
  getComment() {
    wx.showLoading({
      title: '加载中 ',
    })
    var page = this.data.page
    let that = this;
    wx.cloud.callFunction({
      name: 'commentHandle',
      data: {
        action: 'getComments',
        newsId: that.data.id,//改为that.data.id
        page: page,
        num: 5
      }
    }).then(res => {
      if(res.result.length != 0){
        wx.hideLoading()
        // 处理提交结果
        page = page + 1
        // console.log(res)
        this.watchHeight()//当获取数据后再扩展页面长度
        this.setData({
          comments: this.data.comments.concat(res.result),
          page : page
        })
        this.getTotal()
        // console.log(this.data.comments);
      }else{
        wx.hideLoading()
        this.setData({
          flag : 1
        })
      }
    })
  },

  getData() {
    wx.cloud.callFunction({
      name: "newsHandle",  //云函数名
      data: {
        action: "getDetail",
        newsId: this.data.id,
      }
    }).then(res => {
      // console.log(res)
      this.setData({
        // newsContent: this.data.newsContent.push(newsContenttmp)
        'newsContent.id': res.result._id,
        'newsContent.title': res.result._newsTitle,
        'newsContent.source': res.result._newsSource,
        'newsContent.date': res.result._date,
        'newsContent.describe': res.result._newsContent,
        'newsContent.userId': res.result._userId,
        'newsContent.userName': res.result._userName,
        'newsContent.avatar': res.result._avatar
      })
    })
  },

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

  onReachBottom: function () {
    console.log("onReachBottom getComment")
    var that = this
    let query = wx.createSelectorQuery()
    query.select('.container').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let top = res[0].top;
      let scrollTop = res[1].scrollTop - res[0].top;
      console.log("scrollTop:   "+scrollTop)
      if(scrollTop > 250) {//防止切换类别时误触发onReachBottom
        that.getComment();
       }
    })
  },

  viewUserInfo(){
    wx.navigateTo({
      url: '/pages/publishShow/publishShow?id=' + this.data.newsContent.userId,
    })
  },
})




