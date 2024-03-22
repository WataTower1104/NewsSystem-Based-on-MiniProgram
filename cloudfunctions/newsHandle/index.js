// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: "cloud1-3gxnf2n02c9c42ac" }) // 使用当前云环境
const db = cloud.database().collection('news-table')

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.action == "updataNews"){
    return await db.doc(event.id).update({
      data:{
        _newsTitle:event.detail.title,
        _newsType:event.detail.type,
        _newsContent:event.detail.content,
        _newsSource:event.detail.source
      }
    })
    .then(res => {
      console.log('FROM CLOUD:news detail updata success!',res);
      return res.errCode;
    })
    .catch(res => {
      console.log('FROM CLOUD:news detail updata fail!',res);
      // const r = await db.where({
      //   _id:event.id
      // }).remove()
      return {
        msg:'news detail updata fail',
        result:r,
        errCode: res.errCode
      };
    })
  }
  else if(event.action == "deleteNews"){
    let res = await db.where({
      _id:event.newsId
    }).remove()
    console.log(res)
    return res;
  }
  else if(event.action == "getBriefs"){
    let db_limit = db;

    if(event.condition){
      db_limit = db_limit.where({
        _newsType: event.condition
      })
    }

    return await db_limit.orderBy('_date','desc').skip(event.page*event.num).limit(event.num)
      .field({
        _id:true,
        _newsTitle:true,
        _newsSource:true,
        _date:true,
        _newsType:true
      }).get({
      success: res => {
        console.log(res);
        return res;
      }
    });
  }
  else if(event.action == "getDetail"){
    try {
      // 使用聚合操作进行多表联查
      const result = await db
        .aggregate()
        .match({
          _id: event.newsId
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
          _newsContent: 1,
          _newsSource: 1,
          _newsTitle: 1,
          _userId: 1,
          _userName: 1,
          _avatar: 1
        })
        .end();
      console.log("初始结果",result)
      // 获取查询结果
      const news = result.list[0];
      return news;
    } catch (err) {
      console.error(err);
      return {
        errCode:-1,
        msg:err
      };
    }
  
    
  }
  else{
    console.log('error action parameter');
    return null;
  }
}