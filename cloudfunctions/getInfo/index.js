// 云函数入口文件
const cloud = require('wx-server-sdk')

const COURSE_PER_DAY = 6
const MAX_LIMIT = 100
cloud.init()

// 云函数入口函数

exports.main = async (event, context) => {
  // cloud.init()
  const wxContext = cloud.getWXContext()
  var db = cloud.database()
  const _ = db.command
  var nameList = []
  var reslut = {
    'name-list': [],
    'info-list': [],
  }
  var p1
  if　(event.floor != 0) {
    p1 = db.collection(event.buildingID).where({
        '_id': event.buildingID + "-f" + event.floor,
      }).get()
  } else {
    p1 = db.collection(event.buildingID).get()
  }
  console.log('-----------------------')
  var data = (await p1).data
  console.log(data)
  for (var i = 0; i < data.length; i++) {
    // nameList = nameList.concat(data[i]['room-name'])
    reslut['name-list'] = reslut['name-list'].concat(data[i]['room-name'])
    var idList = data[i]['room-id']
    var sql_exec = db.collection('room-info').where({
      _id: _.in(idList)
    })
    const countResult = (await sql_exec.count()).total
    const batchTimes = Math.ceil(countResult / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = sql_exec.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    var infoList = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    }).data
    var startDay = (event.num - 1) * COURSE_PER_DAY
    infoList = infoList.map(ele => {
      return ele.info.slice(startDay, startDay + COURSE_PER_DAY)
    })
    reslut['info-list'] = reslut['info-list'].concat(infoList)

  }
  
  return reslut
}