//pickNumBasket.js
import api from '../../utils/api'
import util from '../../utils/util'
const {
  uuid
} = util

Page({
  data: {
    confirmVisible: false,
    bs: 1, //倍数
    totalZs: 2, //总注数
    totalMoney: 0, //总金额
    lotteryList: [
      // {
      //   id: uuid(),
      //   num: '08,09,10,20,21,23|06',
      //   lotCode: '50',
      //   play: 50001,
      //   zs: 1
      // },
    ],
  },
  onLoad: function (options) {
    this.initPage()
  },
  initPage() {
    //获取全局选号信息
    let lotteryList = wx.getStorageSync('lotteryList') || []
    this.setData({
      lotteryList
    }, () => {
      // 计算总注数(累加)
      this.calcTotalZs()
    })
  },

  // 更新倍数
  updateBs(bs) {
    const {
      totalZs
    } = this.data
    const totalMoney = totalZs * bs * 2
    this.setData({
      bs,
      totalMoney
    })
  },
  // 倍数+-1
  addOrReduceNum(e) {
    const {
      type
    } = e.currentTarget.dataset
    const {
      bs
    } = this.data
    if (type === 'add') {
      this.updateBs(bs + 1)
    }
    if (type === 'reduce') {
      if (bs >= 1) {
        this.updateBs(bs - 1)
      }
    }
  },
  // 手动输入倍数
  inputChange(e) {
    console.log(e)
    const {
      value
    } = e.detail
    let bs = 0
    if (!util.isEmpty(value)) {
      if (util.checkNumber(value)) {
        bs = ~~value
      } else {
        bs = this.data.bs
        util.warning('倍数为正整数哦！')
      }
    } else {
      bs = 0
    }
    this.updateBs(bs)
  },


  // 计算单行注数（根据lotCode,play排列组合）
  calcSingleZs(lot) {
    return 1;
  },
  // 计算总注数(累加)
  calcTotalZs() {
    let {
      lotteryList,
      bs
    } = this.data

    let totalZs = 0
    lotteryList.map(item => {
      totalZs += item.zs
    })
    const totalMoney = totalZs * bs * 2
    this.setData({
      lotteryList,
      totalZs,
      totalMoney
    })
  },

  // 删除一行
  delLot(e) {
    console.log(e)
    const {
      item = {}
    } = e.currentTarget.dataset
    let {
      lotteryList
    } = this.data
    lotteryList = lotteryList.filter(lot => lot.id !== item.id)
    //存储全局选号信息
    wx.setStorageSync('lotteryList', lotteryList);
    this.setData({
      lotteryList
    }, () => {
      // 计算总注数(累加)
      this.calcTotalZs()
    })
  },
  // 清空列表
  clearLot() {
    //存储全局选号信息
    wx.setStorageSync('lotteryList', []);
    this.setData({
      lotteryList: []
    }, () => {
      // 计算总注数(累加)
      this.calcTotalZs()
    })
  },
  // 回到首页选号
  toIndex() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },
  // 生成二维码
  createQrCode() {
    const {
      totalMoney
    } = this.data
    if (!totalMoney) {
      return;
    }
    this.toggleConfirmDialog()
  },
  // 生成二维码确认弹框
  toggleConfirmDialog() {
    this.setData({
      confirmVisible: !this.data.confirmVisible,
    });
  },
  // 确认提交
  confirmSubmit() {
    // 关闭确认弹框
    this.toggleConfirmDialog()
    //获取全局tab信息
    const tab = wx.getStorageSync('tab');
    let lotId=util.getLotIdByTab(tab)
    const {
      lotteryList
    } = this.data
    let bet_number_arr=lotteryList.map(item=>{
      // if(lotId===51&&item.play_id==='51001'){
      //   item.num=item.num.replace(/,/g, ' ')
      // }
      return item.num
    })
    const bet_number=bet_number_arr.join("$")
    const params = {
      lot_id: lotId,
      bet_number
    }
    // 生成二维码（生成订单）
    api.createQrCode(params)
      .then(res => {
        const data = res.data || {}
        // 组装详情数据
        const params = {
          ...data,
          lot_code: data.lot_id,
          bet_project_id: data.project_id,
          bet_number,
          total_amount: data.total_amt,
          isFromIndex: true
        }
        // 清空列表
        this.clearLot()
        // 跳转详情
        wx.navigateTo({
          url: '/pages/detail/index?data=' + JSON.stringify(params),
        });
      })
      .catch(res => {
        const errorMsg = res.msg
        util.error(errorMsg)
      })
  }
})