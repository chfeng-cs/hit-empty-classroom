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
  var nameList = []
  var idList = []
  var p1

  var floorList = []
  // if (event.floor)


  if 　(event.floor != 0) {
    p1 = db.collection(event.buildingID).where({
      '_id': event.buildingID + "-f" + event.floor,
    }).get()
  } else {
    p1 = db.collection(event.buildingID).get()
  }
  var data = (await p1).data
  console.log(data)
  console.log(event.buildingID + "-f" + event.floor)
  for (var i = 0; i < data.length; i++) {
    nameList = nameList.concat(data[i]['room-name'])
    idList = idList.concat(data[i]['room-id'])
  }

  const _ = db.command
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
  return {
    'name-list': nameList,
    'info-list': infoList,
  }
}