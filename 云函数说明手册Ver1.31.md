使用 目录 或 Ctrl+F 查找所需函数

### `commentHandle()`

目前有着两个子函数：`getComments`、`postComment`和`deleteComment`。

**※以下默认存在`action`参数。**

#### `getComments`

获得评论数组，默认按**时间从新到旧**的顺序返回结果，共三个参数。

| data参数 | 描述                              |
| -------- | --------------------------------- |
| newsId   | 选出相应新闻中的复数个评论        |
| page     | 当前的页数，初始值应为0           |
| num      | 每页的个数，调用后会返回num个评论 |

- 调用示范:

  ```javascript
  getComment() {
    let that = this;
      
    // 调用云函数获取评论
    wx.cloud.callFunction({
      name: 'commentHandle',
      data: {
        action: 'getComments',
        newsId: '123465',
        page: 0,
        num: 1
      }
    }).then(res => {
      // 处理提交结果
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
  },
  ```

  

- 返回对象结构:

  ```json
  {
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
      requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
      result:{
      	data:{
              [
                  {
                      _id: "b25260ae646b52d0001bf05027210a7a",	// 评论的ID
                      _newsId: "123465", 							// 评论所属新闻的ID
                      _date: "2023-05-22 19:31:00",				// 评论发布时间
                      _userId: "465sss", 							// 发布该评论的用户ID
                      _userName:"ohoo",							// 发布该评论的用户名
                      _avatar:"cloud://test.img",					// 该用户头像
                      _content: "test"							// 该评论的内容
                  },
              ],
      		length: 1											// 返回的评论数组长度
          },
      errMsg: "collection.get:ok"
      }
  }
  ```

  

#### `postComment`

提交评论，共三个参数。

| data参数 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| content  | 将要上传的评论内容                                           |
| newsId   | 与该评论对应的相关新闻ID                                     |
| time     | 格式为`yyyy-mm-dd hh:mm:ss`的时间，通过`getFormatTime()`函数获得，可在`newsEditor.js`中复制 |
| userId   | 用户的`openid`，通过云函数`getOpenid()`的调用结果中的`openid`获得 |

- 调用示范:

  ```javascript
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
          date: this.getFormatTime(),
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
  ```



- 返回对象结构:

  ```json
  {
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
      requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",		// 本次执行的任务ID
      result:{
      	data:{
      		_id:"0122a587647179750e21075a0da4aa97"				// 添加的新评论ID
      		errMsg: "collection.get:ok"
		}
      }
  }
  ```



#### `deleteComments`

删除评论，共一个参数。

| data参数  | 描述             |
| --------- | ---------------- |
| commentId | 将要删除的评论ID |

- 调用示范:

```javascript
getComment() {
  let that = this;
    
  // 调用云函数获取评论
  wx.cloud.callFunction({
    name: 'commentHandle',
    data: {
      action: 'deleteComments',
      commmentId: '0122a587647179750e21075a0da4aa97',
    }
  }).then(res => {
    // 处理提交结果
    console.log(res);

  })
},
```



- 返回对象结构:

```json
{
	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
  	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
    result:{
  		stats:{"removed":1},
        errMsg:"document.remove:ok"
  	},
    errMsg: "collection.get:ok"
}
```



### `newHandle()`

目前有着4个子函数：`updataNews`、`deleteNews`、`getBriefs`和`getDetail`,各细节如下:

**※以下默认存在`action`参数。**

#### `updataNews`

上传/更新新闻，所需参数共4个。

| data参数       | 描述                   |
| -------------- | ---------------------- |
| detail.title   | 新闻的标题             |
| detail.type    | 新闻的类型             |
| detail.content | 新闻的正文，为HTML格式 |
| detail.source  | 新闻的来源             |

- 调用示范:

```javascript
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
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```



- 返回对象结构:

```json
{
 	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result:{
  		stats: {updated: 1},
  		errMsg: "document.update:ok"
	},
   	errMsg: "collection.get:ok"
}
```

  

#### `deleteNews`

删除新闻，所需参数有1个。

| data参数 | 描述             |
| -------- | ---------------- |
| newsId   | 需要删除的新闻ID |

- 调用示范:

```javascript
wx.cloud.callFunction({
  name: "newsHandle",
  data: {
    action:"deleteNews"
    newsId: this.data.newsId
  },
}).then(result => {
  console.log('delete success', result);
  // 其他操作
}).catch(error => {
  console.log('delete fail', error);
  // 其他操作
})
```

- 返回对象结构:

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result:{
  		stats: {remove: 1},
  		errMsg: "document.remove:ok"
	},
   	errMsg: "collection.get:ok"
}
```



#### `getBriefs`

获取简略新闻列表，必需参数有2个，非必需参数1个，默认按**时间从新到旧**的顺序返回结果。

| data参数          | 描述                                    |
| ----------------- | --------------------------------------- |
| page              | 当前的页数，初始值应为0                 |
| num               | 每页的个数，调用后会返回`num`条新闻简述 |
| condition(非必要) | 选择返回对应类型的结果，类型为字符串    |

- 调用示范:

  ```javascript
  wx.cloud.callFunction({
    name: 'newsHandle',
    data: {
      action: 'getBriefs',
      page: 0,
      num: 5
      //condition:'时事'
    },
  }).then(result => {
    // 处理返回的数据
    console.log(res); 
    // 其他操作
  }).catch(error => {
    console.log('get fail', error);
    // 其他操作
  });
  ```

- 返回对象结构:

```json
  {
      errMsg: "cloud.callFunction:ok",
  	requestID: "0ac8d189-5aee-4dfd-aec9-06a8444******",
  	result:{
              [
                  {
                      _date: "2023-05-20 21:31:46",
                      _id: "145ba9456468cbc20001a132294666b5",
                      _newsSource: "eeee",
                      _newsTitle: "eeeee",
                      _newsType: "时事"
                  },
  				{},
  				...
  				{},
              ],
  			length:5
  	}
  }
```

  

#### `getDetail`

获得新闻详细内容及上传用户相关信息，所需参数共1个。

| data参数 | 描述             |
| -------- | ---------------- |
| newsId   | 需要获得的新闻ID |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: 'newsHandle',
  data: {
    action: 'getDetail',
    newsId: 'da2c5dc56468c6e7000c6c832f7b5aea'
  },
}).then(res => {
  // 处理返回的数据
  console.log(res); 
  // 其他操作
}).catch(error => {
  console.log('get fail', error);
  // 其他操作
});
```

- 返回对象结构：

```json
{
    errMsg: "cloud.callFunction:ok",
	requestID: "3a59966c-0a68-415b-aeb6-5ef3022644aa",
	result:{
            _avatar: "cloud://test.img",
			_date: "2023-05-20 21:11:04",
			_id: "da2c5dc56468c6e7000c6c832f7b5aea",
			_newsContent: "<p>aaaaa</p>",
			_newsSource: "aaaa",
			_newsTitle: "aaaa",
			_userId: "o659L5bbjjX2oPZApT0DyW9UIZ8A",
            _userName: "ohoo",
	}
}
```



### `videoHandle()`

目前有着3个子函数：`getVideos`、`deleteVideo`和`postVideo`,各细节如下:

**※以下默认存在`action`参数。**

#### `getVideos`

用于获取视频列表，默认按**时间从新到旧**的顺序返回结果，无所需参数。

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: 'videoHandle',
  data: {
    action: 'getVideos'
  },
}).then(res => {
  // 处理返回的数据
  console.log(res); 
  // 其他操作
}).catch(error => {
  console.log('get fail', error);
  // 其他操作
});
```

- 返回对象结构：

```json
{
    errMsg: "cloud.callFunction:ok",
	requestID: "c1e9f298-6603-4842-b926-0a6221670fa6",
	result:{
            [
        		{
                	_avatar: "cloud://test.img",
					_date: "2023-05-20 21:11:04",
					_id: "da2c5dc56468c6e7000c6c832f7b5aea",
                    _recap:"视频描述",		// 视频的描述
                    _title:"测试视频",		// 视频的标题
                    _userId:"o659L5bbjjX2oPZApT0DyW9UIZ8A",
                    _userName:"ohoo",
                    _videoPath:"cloud://c.mp4"	// 视频的地址
                },
        		...
				{},
        	],
        	length: 5
	}
}
```


#### `getVideoInfo`

用于获取视频详细信息，需一个参数。

| data参数 | 描述             |
| -------- | ---------------- |
| videoId   | 需要获得的视频ID |


- 调用示范：

```javascript
wx.cloud.callFunction({
  name: 'videoHandle',
  data: {
    action: 'getVideoInfo',
    videoId:'o659L5bbjjX2oPZApT0DyW9UIZ8A'
  },
}).then(res => {
  // 处理返回的数据
  console.log(res); 
  // 其他操作
}).catch(error => {
  console.log('get fail', error);
  // 其他操作
});
```

- 返回对象结构：

```json
{
    errMsg: "cloud.callFunction:ok",
	requestID: "c1e9f298-6603-4842-b926-0a6221670fa6",
	result:{
            {
            _avatar: "cloud://test.img",
            _date: "2023-05-20 21:11:04",
            _id: "da2c5dc56468c6e7000c6c832f7b5aea",
            _recap:"视频描述",		// 视频的描述
            _title:"测试视频",		// 视频的标题
            _userId:"o659L5bbjjX2oPZApT0DyW9UIZ8A",
            _userName:"ohoo",
            _videoPath:"cloud://c.mp4"	// 视频的地址
            },
	}
}
```



#### `postVideo`

用于上传视频，所需参数共3个。

| data参数  | 描述                   |
| --------- | ---------------------- |
| title     | 所上传视频的标题       |
| recap     | 所上传视频的概述       |
| videoPath | 所上传视频的云存储地址 |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: 'videoHandle',
  data: {
    action: 'postVideos',
    recap:'这里是视频的描述',
    title:'这里是标题',
    videoPath:'cloud://c.mp4'
  },
}).then(res => {
  // 处理返回的数据
  console.log(res); 
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
});
```

- 返回对象结构：

```json
{
    errMsg: "cloud.callFunction:ok",
	requestID: "c1e9f298-6603-4842-b926-0a6221670fa6",
	result:{
        msg:{
  			stats: {
    			"updated": 1
  			},
  			errMsg: "document.update:ok"
		}
    }
}
```



#### `deleteVideo`

删除新闻，所需参数有1个。

| data参数 | 描述             |
| -------- | ---------------- |
| videoId  | 需要删除的视频ID |

- 调用示范:

```javascript
wx.cloud.callFunction({
  name: "videoHandle",
  data: {
    action:"deleteVideo",
    newsId: this.data.newsId
  },
}).then(result => {
  console.log('delete success', result);
  // 其他操作
}).catch(error => {
  console.log('delete fail', error);
  // 其他操作
})
```

- 返回对象结构:

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result:{
  		stats: {remove: 1},
  		errMsg: "document.remove:ok"
	},
}
```





### `userHandle`()

目前有着10个子函数：`register`、`login`、`getCollections`、`addCollection`、`removeCollection`、`getHistorys`、`addHistory`、`removeHistory`、`getUserInfo`、`updateInfo`、`getNewsPublished`和`getVideoPublished`各细节如下:

**※以下默认存在`action`参数。**

#### `register`

用于用户注册，自带检测用户名是否重复功能，所需参数共两个，头像为默认，最后返回用户的ID。

| data参数 | 描述       |
| -------- | ---------- |
| userName | 用户的名称 |
| password | 用户的密码 |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"register",
    userName:"ohoo",
    password:"123456789"
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        errCode: 1,
        msg: 'Register success.',
        userId: 'o659L5bbjjX2oPZApT0DyW9UIZ8A'
    },
}
```



#### `login`

用于用户登录，所需参数共2个，最后返回用户的ID。

| data参数 | 描述       |
| -------- | ---------- |
| userName | 用户的名称 |
| password | 用户的密码 |

- 调用示范

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"login",
    userName:"ohoo",
    password:"123456789"
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
      errCode: 1,
      msg: 'Login success.',
      userId: 'o659L5bbjjX2oPZApT0DyW9UIZ8A'
    }
}
```



#### `getCollections`

获取用户收藏，共一个参数。

| data参数 | 描述     |
| -------- | -------- |
| userId   | 用户的ID |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"getCollections",
	userId: 'o659L5bbjjX2oPZApT0DyW9UIZ8A'
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
      	[
            {
                "_newsId":"fc8e6465646ed3720dcbcc6526b4ad97",	// 收藏新闻的ID
                "_date":"2023-05-26 11:18:09",					// 收藏日期
                "_newsSource":"楚天都市报",						 // 新闻来源
                "_newsTitle":"美国最长寿总统卡特近况曝光",    		// 新闻标题
                "_userId":"o659L5bbjjX2oPZApT0DyW9UIZ8A",		//上传用户ID
                "_userName":"ohoo"								//上传用户名称
            },
        	{},...{}
        ],
        length:2
    }
}
```



#### `addCollection`

用于添加收藏，共有两个参数。

| data参数 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| userId   | 执行收藏的用户ID                                             |
| date     | 执行收藏的时间，格式为`yyyy-mm-dd hh:mm:ss`，可以通过`getFormatTime()`函数获得 |
| newsId   | 将要收藏的新闻ID                                             |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"addCollection",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
    date:"2023-05-27 14:15:27",
    newsId:'fc8e6465646ed3720dcbcc6526b4ad97'
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        stats:{updated:1},
        errMsg:"document.update:ok"
    }
}
```





#### `removeCollection`

移除收藏，所需参数共两个。

| data参数 | 描述                 |
| -------- | -------------------- |
| userId   | 执行删除收藏的用户ID |
| newsId   | 将要删除的新闻ID     |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"removeCollection",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
    newsId:"fc8e6465646ed3720dcbcc6526b4ad97"
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        stats:{remove:1},
        errMsg:"document.remove:ok"
    }
}
```

#### `getHistorys`

获取用户历史记录，共一个参数。

| data参数 | 描述     |
| -------- | -------- |
| userId   | 用户的ID |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"getHisorys",
	userId: 'o659L5bbjjX2oPZApT0DyW9UIZ8A'
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
      	[
            {
                "_newsId":"fc8e6465646ed3720dcbcc6526b4ad97",	// 看过的新闻ID
                "_date":"2023-05-26 11:18:09",					// 浏览时的日期
                "_newsSource":"楚天都市报",						 // 新闻来源
                "_newsTitle":"美国最长寿总统卡特近况曝光",    		// 新闻标题
                "_userId":"o659L5bbjjX2oPZApT0DyW9UIZ8A",		//上传用户ID
                "_userName":"ohoo"								//上传用户名称
            },
        	{},...{}
        ],
        length:2
    }
}
```



#### `addHistory`

用于添加历史记录，共有两个参数。

| data参数 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| userId   | 添加历史记录的用户ID                                         |
| date     | 执行添加的时间，格式为`yyyy-mm-dd hh:mm:ss`，可以通过`getFormatTime()`函数获得 |
| newsId   | 将要被添加的新闻ID                                           |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"addHistory",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
    date:"2023-05-27 14:15:27",
    newsId:'fc8e6465646ed3720dcbcc6526b4ad97'
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        stats:{updated:1},
        errMsg:"document.update:ok"
    }
}
```





#### `removeHistory`

移除出历史记录，所需参数共两个。

| data参数 | 描述                     |
| -------- | ------------------------ |
| userId   | 执行删除历史记录的用户ID |
| newsId   | 将要删除的新闻ID         |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"removeCollection",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
    newsId:"fc8e6465646ed3720dcbcc6526b4ad97"
  },
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        stats:{remove:1},
        errMsg:"document.remove:ok"
    }
}
```



#### `getUserInfo`

获取用户的所有信息，共一个参数。

| data参数 | 描述     |
| -------- | -------- |
| userId   | 用户的ID |

- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"getUserInfo",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A'
  }
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        _avatar: "cloud://1-picture.jpg",
		_id: "o659L5bbjjX2oPZApT0DyW9UIZ8A",
		_password: "123465",
		_userName: "ohoo",
        _collectionCnt:1,
        _historyCnt:0
    }
}
```





#### `updateInfo`

用于更新用户的信息，当前参数只有一个，为通过`getUserInfo`获得的对象

| data参数 | 描述                                                         |
| -------- | ------------------------------------------------------------ |
| userInfo | 通过`getUserInfo`获得的对象，具体结构参考对应函数的返回对象结构 |

- 调用示范：

```javascript
userInfo = {
        _avatar: "cloud://1-picture.jpg",
		_id: "o659L5bbjjX2oPZApT0DyW9UIZ8A",	//不可修改
		_password: "123465",
		_userName: "ohoo",
        _collectionCnt:1,						//不可修改
        _historyCnt:0							//不可修改
};

wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"updateInfo",
	userInfo:userInfo
  }
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
        stats:{updated:1},
        errMsg:"document.update:ok"
    }
}
```



#### `getNewsPublished`

用于获取用户发布的文字新闻，当前参数只有一个。

| data参数 | 描述         |
| -------- | ------------ |
| userId   | 用户的ID     |


- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"getNewsPublished",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
  }
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
			[
                  {
                      _date: "2023-05-20 21:31:46",
                      _id: "145ba9456468cbc20001a132294666b5",
                      _newsSource: "eeee",
                      _newsTitle: "eeeee",
                      _newsType: "时事",
                      _userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
                      _userName:'ohoo',
                      _avatar:'www.baidu.com'
                  },
  				{},
  				...
  				{},
              ],
  			length:5
    }
}
```



#### `getVideoPublished`

用于获取用户发布的视频，当前参数只有一个。

| data参数 | 描述         |
| -------- | ------------ |
| userId   | 用户的ID     |


- 调用示范：

```javascript
wx.cloud.callFunction({
  name: "userHandle",
  data: {
    action:"getVideoPublished",
	userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
  }
}).then(result => {
  console.log(result);
  // 其他操作
}).catch(error => {
  console.log(error);
  // 其他操作
})
```

- 返回对象结构：

```json
{
  	errMsg: "cloud.callFunction:ok",							// 云函数执行结果
 	requestID: "605425a3-232a-428e-81f1-0ba61ce9b3f3",			// 本次执行的任务ID
   	result: {
			[
                  {
                      _date: "2023-05-20 21:31:46",
                      _id: "145ba9456468cbc20001a132294666b5",
                      _title: "小短片",
                      _recap: "猫猫猫",
                      _userId:'o659L5bbjjX2oPZApT0DyW9UIZ8A',
                      _userName:'ohoo',
                      _avatar:'www.baidu.com'
                  },
  				{},
  				...
  				{},
              ],
  			length:5
    }
}
```





---

### 版本说明：

- ver1.0: 

  完成了四个云函数的使用说明。

- ver1.1: 

  添加`getNewsPublished`和`getVideoPublished`两种方法获得用户已发布的信息。

- ver1.21:

  修改了部分错误文本，注意`postComment`方法中时间的参数名称，关于时间的参数名称默认为`date`。

  完善了`updateInfo`方法可修改的用户信息。
  
- ver1.30:

  添加了`getVideoInfo`方法，用于获取单个视频信息。