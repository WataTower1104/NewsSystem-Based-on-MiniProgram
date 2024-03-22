// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database().collection('user-info-table')

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event.action);
  if (event.action === 'register') {
    const { userName, password } = event;

    // 检查用户名是否重复
    const duplicateUser = await db
      .where({
        _userName: userName
      })
      .get();

    if (duplicateUser.data.length > 0) {
      return {
        errCode: -2,
        msg: 'UserName already exist.'
      };
    }

    try {
      // 添加用户记录
      const result = await db.add({
        data: {
          _userName: userName,
          _password: password,
          _avatar: 'cloud://cloud1-3gxnf2n02c9c42ac.636c-cloud1-3gxnf2n02c9c42ac-1317965161/Users/1-picture.jpg',
          _collections: "[]",
          _historys: "[]"
        }
      });

      return {
        errCode: 1,
        msg: 'Register success.',
        userId: result._id
      };
    } catch (err) {
      console.error(err);
      return {
        errCode: -3,
        msg: 'Register fail. =>>>' + err
      };
    }
  }
  else if (event.action === 'login') {
    const { userName, password } = event;

    // 根据用户名获取用户信息
    const user = await db
      .where({
        _userName: userName
      })
      .get();

    if (user.data.length === 0) {
      return {
        errCode: -3,
        msg: 'User not exist.'
      };
    }

    // 验证密码
    const userInfo = user.data[0];
    if (userInfo._password !== password) {
      return {
        errCode: -4,
        msg: 'Password ERROR.'
      };
    }

    return {
      errCode: 1,
      msg: 'Login success.',
      userId: userInfo._id
    };
  }
  else if (event.action === 'getCollections') {
    // 获取用户的收藏
    const user = await db.doc(event.userId).get();
    const collections = JSON.parse(user.data._collections);
    console.log(collections);

    // 根据收藏的newsId获取news表中的内容
    const result = await Promise.all(
      collections.map(async (collection) => {
        const tdb = cloud.database();
        const news = await tdb.collection('news-table').aggregate()
          .match({
            _id: collection.newsId
          })
          .lookup({
            from: 'user-info-table',
            localField: '_userId',
            foreignField: '_id',
            as: 'userInfo'
          })
          .replaceRoot({
            newRoot: {
              $mergeObjects: [
                { _userId: '$_userId' },
                { $arrayElemAt: ['$userInfo', 0] },
                '$$ROOT'
              ]
            }
          })
          .project({
            _id: 1,
            _newsSource: 1,
            _newsTitle: 1,
            _userId: 1,
            _userName: 1,
          })
          .end();

        return {
          _newsId: collection.newsId,
          _date: collection.date,
          _newsSource: news.list[0]._newsSource,
          _newsTitle: news.list[0]._newsTitle,
          _userId: news.list[0]._userId,
          _userName: news.list[0]._userName,
        };
      })
    );

    return result;
  }
  else if (event.action === 'addCollection') {
    // 获取用户的收藏
    const user = await db.doc(event.userId).get();
    const collections = JSON.parse(user.data._collections);
    console.log(collections);

    collections.unshift({ newsId: event.newsId, date: event.date });

    const updatedCollections = JSON.stringify(collections);
    let res = await db.doc(event.userId).update({
      data: {
        _collections: updatedCollections
      }
    });

    return res;
  }
  else if (event.action === 'removeCollection') {
    // 获取用户的收藏
    const user = await db.doc(event.userId).get();
    const collections = JSON.parse(user.data._collections)
    console.log(collections)

    const index = collections.findIndex(item => item.newsId === event.newsId);
    if (index !== -1) {
      collections.splice(index, 1);
    }

    const updatedCollections = JSON.stringify(collections);
    let res = await db.doc(event.userId).update({
      data: {
        _collections: updatedCollections
      }
    });

    return res;
  }
  else if (event.action === 'getHistorys') {
    // 获取用户的历史记录
    const user = await db.doc(event.userId).get();
    const historys = JSON.parse(user.data._historys);
    console.log(historys);

    // 根据历史记录的newsId获取news表中的内容
    const result = await Promise.all(
      historys.map(async (history) => {
        const tdb = cloud.database();
        const news = await tdb.collection('news-table').aggregate()
          .match({
            _id: history.newsId
          })
          .lookup({
            from: 'user-info-table',
            localField: '_userId',
            foreignField: '_id',
            as: 'userInfo'
          })
          .replaceRoot({
            newRoot: {
              $mergeObjects: [
                { _userId: '$_userId' },
                { $arrayElemAt: ['$userInfo', 0] },
                '$$ROOT'
              ]
            }
          })
          .project({
            _id: 1,
            _newsSource: 1,
            _newsTitle: 1,
            _userId: 1,
            _userName: 1,
          })
          .end();
        console.log('add history')
        console.log(news)
        return {
          _newsId: history.newsId,
          _date: history.date,
          _newsSource: news.list[0]._newsSource,
          _newsTitle: news.list[0]._newsTitle,
          _userId: news.list[0]._userId,
          _userName: news.list[0]._userName,
        };
      })
    );
    console.log('historys get');
    console.log(result);
    return result;
  }
  else if (event.action === 'addHistory') {
    // 获取用户的历史记录
    const user = await db.doc(event.userId).get();
    const historys = JSON.parse(user.data._historys);
    console.log(historys);

    const index = historys.findIndex(obj => obj['newsId'] === event.newsId);

    if (index !== -1) {
      const old = historys.splice(index, 1)[0];
      console.log("重复对象存在，已删除旧记录");
      console.log(old);
    }

    historys.unshift({ newsId: event.newsId, date: event.date });

    const updatedHistorys = JSON.stringify(historys);
    let res = await db.doc(event.userId).update({
      data: {
        _historys: updatedHistorys
      }
    });

    return res;
  }
  else if (event.action === 'removeHistory') {
    // 获取用户的历史记录
    const user = await db.doc(event.userId).get();
    const historys = JSON.parse(user.data._historys);
    console.log(historys);

    const index = historys.findIndex(item => item.newsId === event.newsId);
    if (index !== -1) {
      historys.splice(index, 1);
    }

    const updatedHistorys = JSON.stringify(historys);
    let res = await db.doc(event.userId).update({
      data: {
        _historys: updatedHistorys
      }
    });

    return res;
  }
  else if (event.action === 'getUserInfo') {
    // 获取用户的相关信息
    const user = await db.doc(event.userId).get();
    const collectionCnt = JSON.parse(user.data._collections).length;
    const historyCnt = JSON.parse(user.data._historys).length;
    return {
      _avatar: user.data._avatar,
      _id: user.data._id,
      _userName: user.data._userName,
      _collectionCnt: collectionCnt,
      _historyCnt: historyCnt,
      _password: user.data._password
    };
  }
  else if (event.action === 'updateInfo') {

    //获取用户名称，检查是否有改名行为
    const user = await db.doc(event.userInfo._id).get();
    if (user.data._userName !== event.userInfo._userName) {
      const duplicateUser = await db
        .where({
          _userName: event.userInfo._userName
        })
        .get();

      if (duplicateUser.data.length > 0) {
        return {
          errCode: -2,
          msg: 'UserName already exist.'
        };
      }
    }

    let res = await db.doc(event.userInfo._id).update({
      // data 传入需要局部更新的数据
      data: {
        // 表示将 done 字段置为 true
        _avatar: event.userInfo._avatar,
        _userName: event.userInfo._userName,
        _password: event.userInfo._password
      },
    })

    console.log(res);
    return {
      errCode:1,
      msg:'Update Success',
      result:res
    };

  }
  else if (event.action == 'getNewsPublished') {
    try {
      // 使用聚合操作进行多表联查
      const db_news = cloud.database().collection('news-table');
      const result = await db_news
        .aggregate()
        .match({
          _userId: event.userId
        })
        .lookup({
          from: 'user-info-table',
          localField: '_userId',
          foreignField: '_id',
          as: 'userInfo'
        })
        .replaceRoot({
          newRoot: {
            $mergeObjects: [
              { _userId: '$_userId' },
              { $arrayElemAt: ['$userInfo', 0] },
              '$$ROOT'
            ]
          }
        })
        .project({
          _id: 1,
          _date: 1,
          _newsSource: 1,
          _newsTitle: 1,
          _newsType: 1,
          _userId: 1,
          _userName: 1,
          _avatar: 1
        })
        .end();
      console.log("初始结果", result)
      // 获取查询结果
      const news = result.list;
      return news;
    } catch (err) {
      console.error(err);
      return {
        errCode: -1,
        msg: err
      };
    }
  }
  else if (event.action == 'getVideoPublished') {
    try {
      // 使用聚合操作进行多表联查
      const db_video = cloud.database().collection('video-news');
      const result = await db_video
        .aggregate()
        .match({
          _userId: event.userId
        })
        .lookup({
          from: 'user-info-table',
          localField: '_userId',
          foreignField: '_id',
          as: 'userInfo'
        })
        .replaceRoot({
          newRoot: {
            $mergeObjects: [
              { _userId: '$_userId' },
              { $arrayElemAt: ['$userInfo', 0] },
              '$$ROOT'
            ]
          }
        })
        .project({
          _id: 1,
          _date: 1,
          _recap: 1,
          _title: 1,
          _userId: 1,
          _userName: 1,
          _avatar: 1
        })
        .end();
      console.log("初始结果", result)
      // 获取查询结果
      const news = result.list;
      return news;
    } catch (err) {
      console.error(err);
      return {
        errCode: -1,
        msg: err
      };
    }
  }
  else {
    return {
      errCode: -1,
      msg: 'Error Action Parameter.'
    }
  }
}