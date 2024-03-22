// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    scrollTop:0,
    select: 0,
    height: 0,
    page:0,
    isCollected:0,
    id:'',
    type:{
      '时事':1,
      '体育':2,
      '民间':3,
      '科技':4,
    },
    id: '',
    sortList: [{
      name: '全部',
      id: 0
    },
    {
      name: '时事',
      id: 1
    },
    {
      name: '体育',
      id: 2
    },
    {
      name: '民间',
      id: 3
    },
    {
      name: '科技',
      id: 4
    },
    ],
    briefs: [{
      flag: 1,
      page: 0,
      brief: [],
      id: 0
    },
    {
      flag: 0,
      page:0,
      brief: [],
      id: 1
    },
    {
      flag: 0,
      page:0,
      brief: [],
      id: 2
    },
    {
      flag: 0,
      page:0,
      brief: [],
      id: 3
    },
    {
      flag: 0,
      page:0,
      brief: [],
      id: 4
    },
    ],
  },

  onLoad() {
    this.setData({
      scrollTop:0,
      select: 0,
      height: 0,
      page:0,
      isSend:0,
      id: '',
      briefs: [{
        flag: 1,
        page: 0,
        brief: [],
        id: 0
      },
      {
        flag: 0,
        page:0,
        brief: [],
        id: 1
      },
      {
        flag: 0,
        page:0,
        brief: [],
        id: 2
      },
      {
        flag: 0,
        page:0,
        brief: [],
        id: 3
      },
      {
        flag: 0,
        page:0,
        brief: [],
        id: 4
      },
      ],
    })
    console.log("onLoad getBriefs")
    this.getBriefs();
  },

  onPullDownRefresh:function(){
      var that = this
      //导航条加载动画
      wx.showNavigationBarLoading()
      //loading 提示框
      wx.showLoading({
        title: 'Loading...',
      })
      console.log("下拉刷新啦");
      //刷新数据
      this.setData({
        scrollTop:0,
        select: 0,
        height: 0,
        page:0,
        isSend:0,
        id: '',
        briefs: [{
          flag: 1,
          page: 0,
          brief: [],
          id: 0
        },
        {
          flag: 0,
          page:0,
          brief: [],
          id: 1
        },
        {
          flag: 0,
          page:0,
          brief: [],
          id: 2
        },
        {
          flag: 0,
          page:0,
          brief: [],
          id: 3
        },
        {
          flag: 0,
          page:0,
          brief: [],
          id: 4
        },
        ],
      })
      console.log("onPullDownRefresh getBriefs")
      this.getBriefs()
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      //停止下拉刷新
      wx.stopPullDownRefresh();

  },

  // 触发tab导航栏
  activeTab(e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      select: index
    })
    this.generalEv()
    this.watchHeight()
  },

  // 滑动swiper
  activeSw(e) {
    this.generalEv()
    var index = e.detail.current
    this.setData({
      select: index
    })
    if(this.data.briefs[this.data.select].flag == 0){
      console.log("activeSw getBriefs")
      this.data.briefs[this.data.select].flag = 1//第一次划进来时再加载
      this.getBriefs()
    }
    this.generalEv()
    this.watchHeight()
  },

  // 监听swiper高度,增加高度
  watchHeight() {
    var query = wx.createSelectorQuery()
    var box = '.box'+this.data.select
    query.select(box).boundingClientRect((res) => {//实时刷新box高度
      this.setData({
        height: parseInt(res.height)
      })
      console.log("watchHeight: "+res.height)
    }).exec()
  },

  getBriefs() {
    wx.showLoading({
      title: '加载中',
    })

    var select = this.data.select
    var page = this.data.briefs[select].page
    var condition =''
    if(select == 0){
      var condition =''
    }else{
      var condition =this.data.sortList[select].name
    }
    console.log("类别:",condition);
    wx.cloud.callFunction({
      name: 'newsHandle',
      data: {
        action: 'getBriefs',
        page: page,
        num: 9,
        condition:condition
      },
    }).then(res => {
      // 处理返回的数据
      if(res.result.data.length != 0){
        console.log(res);
        var change = 'briefs['+select+'].brief'//要修改的数组位置
        var changep = 'briefs['+select+'].page'//要修改的数组页面数量
        this.setData({
          [change]: this.data.briefs[select].brief.concat(res.result.data),
          [changep] : page + 1,
        })
        this.watchHeight()//当获取数据后再扩展页面长度
        wx.hideLoading()
      }
      else{
        wx.hideLoading()
        wx.showToast({        
          title: '到底了', //提示内容       
          icon: 'none'      
        })    
      }
    }).catch(error => {
      console.log('get fail', error);
      // 其他操作
    });
  },

  // 初始化值
  generalEv() {
    this.setData({
      placeList: [1, 2, 3, 4]
    })
    // 回到顶部
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  getEvent(e) {
    console.log('newsId--->', e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id;
    this.data.id = id
    var userId = wx.getStorageSync('userId')
    var that = this
    if(userId ==''){
      wx.navigateTo({
        url: '/pages/newsDetail/newsDetail?id=' + id +'&isCollected=0'
      }) 
    }
    else{
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
        wx.navigateTo({
          url: '/pages/newsDetail/newsDetail?id=' + id +'&isCollected='+ that.data.isCollected,
        }) 
      }).catch(error => {
        console.log(error);
        // 其他操作
      })
    }
  },

  getCollection(){

  },

  addNews(){
    let userId = wx.getStorageSync('userId');
    if(userId === ''){
      wx.showToast({
        title: '未登录无法发布！',
        icon:'error'
      })
      return null;
    }
    wx.showActionSheet({
      itemList: ['视频上传', '文章上传'],//显示的列表项
      complete:function(res){
        if(res.tapIndex === 0){
          wx.navigateTo({
            url: '/pages/videoEditor/videoEditor',
          })
        }
        else if(res.tapIndex === 1){
          wx.navigateTo({
            url: '/pages/newsEditor/newsEditor',
          })
        }
        else{
          console.log("user quit")
        }
       }
    })
    
  },

  onReachBottom: function () {
    setTimeout(()=>
      {//设置一定延时，使得切换页面时可以回到顶部再进行判断避免误判
        var box = '.box'+this.data.select
        var that = this
        let query = wx.createSelectorQuery()
        query.select(box).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          let top = res[0].top;
          let scrollTop = res[1].scrollTop - res[0].top;
          console.log("scrollTop:   "+scrollTop)
          if(scrollTop > 10) {//防止切换类别时误触发onReachBottom
            that.setData({ scrollTop: scrollTop })
            that.getBriefs();
           }
        })
        this.watchHeight();
      }, 240)

  },
})
