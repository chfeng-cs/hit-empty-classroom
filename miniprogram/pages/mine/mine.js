// miniprogram/pages/mine/mine.js
const startDay = "2019-09-02"
const MAX_ROOMNAME_LEN = 12
var now = new Date()
var month = (now.getMonth() + 1).toString()
if (month.length <= 1) {
  month = "0" + month
}
var day = now.getDate()
if (day.length <= 1) {
  day = "0" + day
}
var date = now.getFullYear() + "-" + month + "-" + day
var week = getWeekInfo(date)
var louhao = [[
  "016", "000", "000", "000"
], [
  "000"
]]
var multiRoom = [{
  options: ["正心楼", "诚意楼", "主楼", "格物楼", "理学楼", "致知", "管理学院楼", "学士楼", "新技术楼", "机械楼", "材料楼", "电机楼", "管理楼"],
  values: ["016", "027", "002", "015", "018", "025", "021", "007", "010", "012", "013", "019", "022"],
  floorNum: [10, 6, 8, 8, 10, 4, 6, 4, 7, 10, 10, 10, 7],
},
{
  options: ["主楼", "东配楼", "西配楼", "车库楼", "青楼", "理化楼"],
  values: ["033", "032", "042", "043", "044", "048"],
  floorNum: [10, 4, 2, 5, 5, 4],
}]

function getWeekInfo(date) {
  var num = (new Date(date) - new Date(startDay) )/ 3600000 / 24
  var week_x = Math.floor(num / 7) + 1
  var week_y = num % 7
  const week_seq = ["一", "二", "三", "四", "五", "六", "日"]
  return "第" + week_x + "周  周" + week_seq[week_y]
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [["一校区", "二校区"], ["正心楼", "诚意楼", "主楼", "格物楼", "理学楼", "致知", "管理学院楼", "学士楼", "新技术楼", "机械楼", "材料楼", "电机楼", "管理楼"], ["全部", " 1楼", "2楼", "3楼", "4楼", "5楼", "6楼", "7楼", "8楼", "9楼", "10楼"]],
    multiIndex: [0, 0, 0],
    date: date,
    week: week,
    nameList: null,
    infoList: null,
    loading: false,
    item: {
      index: 0,
      msg: 'this is a template',
      time: '2016-09-15'
    },
    scrollHeight: 100,
    windowHeight:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    wx.getSystemInfo({
      success: function(res) {
        var h1 = res.windowHeight

        let query = wx.createSelectorQuery()
        query.select('.section__level1').boundingClientRect()
        // query.selectViewport().scrollOffset()
        query.exec(res => {
          let navbarHeight = res[0].height
          let scrollViewHeight = h1 - navbarHeight
          // console.log(res)
          // console.log(h1)
          // console.log(navbarHeight)
          that.setData({
            scrollHeight: scrollViewHeight,
          })
        })
      }
    })
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindDateChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    var week = getWeekInfo(e.detail.value)
    this.setData({
      date: e.detail.value,
      week: week,
    })
    // console.log(typeof(e.detail.value))
  },
  bindButtonTap: async function(e) {
    var buildingID = multiRoom[this.data.multiIndex[0]].values[this.data.multiIndex[1]]
    var num = (new Date(this.data.date) - new Date("2019-09-02")) / 3600000 / 24 + 1
    // console.log(num)
    var promise = wx.cloud.callFunction({
      name: "getInfo",
      data: {
        buildingID: buildingID,
        num: num,
        floor: this.data.multiIndex[2],
      },
      success: null,
      fail: null,     //fail 未处理
    })
    this.setData({
      loading: true,
    })
    var pResult = (await promise).result
    var nameList = pResult['name-list']
    for(var i=0; i<nameList.length; i++) {
      if (nameList[i].length > MAX_ROOMNAME_LEN) {
        nameList[i] = nameList[i].slice(0, MAX_ROOMNAME_LEN-2) + '...'
      }
    }
    // console.log(ddd)
    this.setData({
      loading: false,
      nameList: nameList,
      infoList: pResult['info-list']
    })
  },
  bindMultiPickerColumnChange: function(e) {

    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var column = e.detail.column
    var value = e.detail.value
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[column] = value;
    // console.log(data)
    if (column == 0) {
      data.multiArray[1] = multiRoom[value].options;
    }
    var floorNum = multiRoom[data.multiIndex[0]].floorNum[data.multiIndex[1]]
    var floorList = ["全部"]
    for(var i=1; i<=floorNum; i++) {
      floorList[i] = "" + i + "楼"
    }
    data.multiArray[2] = floorList
    this.setData(data)


  },
  bindMultiPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  }
})