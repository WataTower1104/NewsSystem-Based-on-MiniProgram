// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database().collection('comments-table')

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.action == "getComments"){
    // 获取的评论结果中需要有用户的相关信息
    try {
      // 使用聚合操作进行多表联查
      const result = await db
        .aggregate()
        .sort({
          _date:-1
        })
        .match({
          _newsId: event.newsId
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
          _content: 1,
          _userId: 1,
          _newsId:1,
          _userName: 1,
          _avatar: 1
        })
        .skip(event.page*event.num)
        .limit(event.num)
        .end();
      console.log("初始结果",result)
      console.log(event.newsId)
      // 获取查询结果
      const comments = result.list;
      return comments;
    } catch (err) {
      console.error(err);
      return {
        errCode:-1,
        msg:'数据库语句执行时出错'
      };
    }

  }
  else if(event.action == "postComment"){
    return await db.add({
      data:{
        _content:event.content,
        _newsId:event.newsId,
        _date:event.date,
        _userId:event.userId
      }
    })
  }
  else if(event.action == "deleteComment"){
    let res = db.doc(event.commentId).remove();
    console.log(res);
    return res;
  }
  else{
    console.log('error action parameter');
    return {
      code:-1,
      msg:'error action parameter'
    };
  }
}

