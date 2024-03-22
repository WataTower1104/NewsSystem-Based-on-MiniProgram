// pages/newsEditor/newsEditor.js
const db = wx.cloud.database();
Page({
  data: {
    title: '',
    newsId: '',
    source: '',
    newsType: -1,
    tempImgId: 1,
    imagesURL: [
      {
        imgId: 0,
        imgUrl: 'null'
      }
    ],
    newsKindsArr: [
      { id: 0, label: '时事' },
      { id: 1, label: '体育' },
      { id: 2, label: '民间' },
      { id: 3, label: '科技' }
    ],
    isReachTop: false,
  },

  // 获取富文本编辑器实例 EditorContext
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;

      // ↓TODO：根据传入新闻ID获得要进行编辑的文章
      that.editorCtx.setContents({ html: "" });
    }).exec()
  },

  // 修改样式
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)
  },

  getTitle(event) {
    this.setData({
      title: event.detail.value
    });
  },

  getSource(event) {
    this.setData({
      source: event.detail.value
    });
  },

  // 添加样式后修改对应样式图标颜色
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },

  // 提交editor中编辑完毕的内容
  formSubmit() {
    let that = this;
    let isEmptyRes = that.isEmpty();
    if (!isEmptyRes.errcode) {
      wx.showToast({
        title: isEmptyRes.msg,
        icon: 'error'
      })
      return;
    }
    if (wx.getStorageSync('userId') === ''){
      wx.showToast({
        title: "仍未登录，无法上传！",
        icon: 'error'
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确定提交吗',
      success(res) {
        wx.showLoading({
          title: '正在上传...',
          mask: true
        })
        if (res.confirm) {
          that.editorCtx.getContents().then(res => {
            if (res.html === '') {
              console.log('输入为空！');
              return;
            }
            that.replaceImageUrls(res.html, that.data.imagesURL).then(res => {
              wx.cloud.callFunction({
                name: 'newsHandle',
                data: {
                  action: 'updataNews',
                  id: that.data.newsId,
                  detail: {
                    title: that.data.title,
                    source: that.data.source,
                    type: that.data.newsKindsArr[that.data.newsType].label,
                    content: res,
                  },
                }
              }).then(result => {
                console.log('submit success', result);
                wx.hideLoading();
                wx.showToast({
                  title: '上传成功！',
                  icon: 'success'
                });
                wx.switchTab({
                  url: '../index/index',
                  success: function (e) {
                    let page = getCurrentPages().pop();
                    if (page == undefined || page == null) return;
                        page.onLoad();
                  }
                })
              }).catch(error => {
                console.log('submit fail', error);
                wx.hideLoading();
                wx.showToast({
                  title: '上传失败',
                  icon: 'error'
                });
              })
            })
          }).catch(error => {
            console.log('替换图片失败', error);
            that.deleteNews();
          });
        } else if (res.cancel) {
          wx.hideLoading();
          return;
        }
      }
    });
  },

  deleteNews() {
    wx.hideLoading();
    wx.showToast({
      title: '上传失败',
      icon: 'error'
    });
    if(this.data.newsId==''){
      console.log("news id empty!");
    }else{
      wx.cloud.callFunction({
        name: "deleteNews",
        data: {
          newsId: this.data.newsId
        },
      }).then(result => {
        console.log('delete success', result);
        // 其他操作
      }).catch(error => {
        console.log('delete fail', error);
        // 其他操作
      })
    }
  },

  isEmpty() {
    if (this.data.newsType === -1)
      return {
        errcode: 0,
        msg: '新闻类型为空'
      }
    else if (this.data.title === '')
      return {
        errcode: 0,
        msg: '新闻标题为空'
      }
    else if (this.data.source === '')
      return {
        errcode: 0,
        msg: '新闻来源为空'
      }
    else
      return {
        errcode: 1,
        msg: 'no empty'
      }
  },

  bindPickerChange(e) {
    this.setData({
      newsType: parseInt(e.detail.value)
    })
  },

  onLoad(res) {
    wx.enableAlertBeforeUnload({ //开启页面退出时的对话框
      message: "文章还未保存，是否退出当前页面？",
      success: function (res) {
        // console.log("成功：", res);
        return true
      },
      fail: function (err) {
        // console.log("失败：", err);
        return false
      },
    });
  },


  // 插入图片
  insertImage() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['origin'],
      success: res => {
        wx.showLoading({
          title: '正在上传图片',
        });
        that.editorCtx.insertImage({
          src: res.tempFiles[0].tempFilePath,
          data: {
            id: that.data.tempImgId,
          },
          height: '80%',
          width: '80%',
          alt: '图片加载失败',
          success: () => {
            that.data.imagesURL.push({
              imgId: that.data.tempImgId,
              imgUrl: res.tempFiles[0].tempFilePath,
            });
            that.setData({
              tempImgId: that.data.tempImgId + 1,
            })
          }
        })
        wx.hideLoading();
      },
      fail: res => {
        console.log('选择图片功能加载失败', res);
        wx.showToast({
          title: '功能加载失败',
          icon: 'error',
          duration: '1500'
        })
      }
    })
  },

  // 替换文本中临时的图片地址为云存储中的地址
  async replaceImageUrls(text, imagesURL) {
    try {
      let that = this;
      let newsId = await that.getNewsId();

      // 正则表达式匹配img标签
      let regex = /<img[^>]+>/g;
      let imgTags = text.match(regex);

      // 如果没有匹配到img标签，则直接返回原始文本
      if (!imgTags) {
        return text;
      }

      // 遍历匹配到的img标签
      for (let i = 0; i < imgTags.length; i++) {
        let imgTag = imgTags[i];

        // 提取data-custom属性中的id值
        let idMatch = imgTag.match(/data-custom\s*=\s*['"]id=(\d+)['"]/);
        if (idMatch && idMatch[1]) {
          let imgId = parseInt(idMatch[1]);

          // 查找与imgId相对应的图片URL
          let imageURL = imagesURL.find((item) => item.imgId === imgId);
          if (imageURL) {
            // 替换img标签中的src为对应的图片URL
            let cloudImgUrl = await that.getCloudImgUrl(imageURL.imgUrl, newsId._id);
            let newImgTag = imgTag.replace(/src\s*=\s*['"][^'"]+['"]/, `src="${cloudImgUrl}"`);
            text = text.replace(imgTag, newImgTag);
          }
        }
      }
      return text;
    } catch (error) {
      console.log(error);
      return null;
    }
  },


  // 将缓存图片上传到云数据库，并传回云数据库文件地址
  async getCloudImgUrl(tempUrl, newsId) {
    try {
      let now = new Date();
      let res = await wx.cloud.uploadFile({
        cloudPath: `News/${newsId}/${now.getTime()}.png`,
        filePath: tempUrl,
      });
      console.log('图片上传成功', res);
      return res.fileID;
    } catch (error) {
      console.log('图片上传失败', error);
      this.deleteNews();
    }
  },

  // 获得新的新闻ID
  async getNewsId() {
    let that = this;
    try {
      let userId = wx.getStorageSync('userId');
      let result = await db.collection('news-table').add({
        data: {
          _userId: userId,
          _date: that.getFormatTime(),
        }
      });
      that.setData({
        newsId: result._id
      })
      console.log('news表新记录添加成功', result);
      return result;
    } catch (error) {
      console.log("news表新记录添加失败", error);
      return null;
    }
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

  // 撤销操作
  undo() {
    this.editorCtx.undo()
  },

  // 重做
  redo() {
    this.editorCtx.redo()
  },

  tab(){
    this.editorCtx.format('textIndent', '2em');
  },

  //清空已输入
  clear() {
    wx.showModal({
      title: '//WARNING//',
      content: '确认要清空目前所有内容吗?',
      success: res => {
        if (res.confirm) {
          this.editorCtx.clear({
            success: () => {
              console.log("clear success")
            }
          })
        }
      }
    })
  },

  mark() {
    this.editorCtx.format('color', '#666666');
    this.editorCtx.format('fontSize', '12px');
    this.editorCtx.format('align', 'center');
  },
})