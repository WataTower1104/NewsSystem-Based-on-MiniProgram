// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database().collection('video-news')

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.action == "getVideos"){
    //TODO:和user表联查，userID做外键返回视频相关信息和上传用户信息，评论表另外获取
    try {
      // 使用聚合操作进行多表联查
      const result = await db
        .aggregate()
        .sort({
          _date:-1
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
          // 索引确定后再改
          _id: 1,
          _date: 1,
          _title: 1,
          _recap: 1,
          _userId:1,
          _videoPath:1,
          _userName: 1,
          _avatar: 1
        })
        .end();
      console.log("初始结果",result)
      // 获取查询结果
      const videos = result.list;
      return videos;
    } catch (err) {
      console.error(err);
      return {
        errCode:-1,
        msg:err
      };
    }

  }
  else if(event.action == "postVideo"){
    return await db.doc(event.id).update({
      data:{
        _title: event.title,
        _recap: event.recap,
        _videoPath: event.videoPath,
      }
    })
    .then(res => {
      console.log(res);
      return {
        msg: res
      }
    })
    .catch(res => {
      console.log(res);
      return {
        msg:res
      }
    })
  }
  else if(event.action == "deleteVideo"){
    let res = await db.where({
      _id:event.videoId
    }).remove()
    console.log(res)
    return res;
  }
  else if(event.action == "getVideoInfo"){
    try {
      // 使用聚合操作进行多表联查
      const result = await db
        .aggregate()
        .match({
          _id: event.videoId
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
          _title: 1,
          _recap: 1,
          _userId:1,
          _videoPath:1,
          _userName: 1,
          _avatar: 1
        })
        .end();
      console.log("初始结果",result)
      // 获取查询结果
      const video = result.list[0];
      return video;
    } catch (err) {
      console.error(err);
      return {
        errCode:-1,
        msg:err
      };
    }
  }
  else{
    console.log("error action");
    return {
      errCode: -1,
      msg:"error action"
    }
  }
}