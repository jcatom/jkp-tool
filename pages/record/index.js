import { $startWuxRefresher, $stopWuxRefresher, $stopWuxLoader } from '../../wux-weapp/dist/index'
import api from '../../utils/api.js'
import {handleOneBetData} from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lot_id:'',
    dataList: [],
    count: 0,
    scrollTop: 0,
    meta: { //分页信息
      "page_num": 1,
      "page_size": 10,
      "total_page": 0,
      "total_size": 0,//所有数据
      "current_size": 1,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const lot_id=options.lot_id||''
    this.setData({lot_id},()=>{
      // 下拉刷新到第一页
      $startWuxRefresher()
    })
  },

  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  onPulling() {
  },
  // 下拉刷新到第一页
  onRefresh() {
    console.log("<<<<<<下拉刷新到第一页")
    //获取列表信息
    const _this = this
    //刷新请求第一页
    var params={
      lot_code: this.data.lot_id,
      days:'-1',//查询天数:-1：全部 0：今天 1：昨天 2：近一周 3：近一月 4：近三月
      statu:'-1',//状态:-1：全部 0：待出票 1：待开奖 2：已中奖 3：未中奖 4：截期未出票
      order_type:'0',//订单类型:0：普通订单 100：预付费订单 200：彩友多订单 300：口袋订单
      page_no: 1,
      page_size: 10,
    }
    api.queryOrderList(params)
        .then(res=>{
            const {meta,datas} = res.data
            datas&&datas.map(item=>{
              handleOneBetData(item)
            })

            if (meta.total_size>meta.page_size) {
              // 停止当前下拉刷新
              $stopWuxRefresher()
            } else {
              console.log('没有更多数据啦！！！且不能继续上拉操作')
              // 停止当前下拉刷新（且不能继续上拉操作）
              $stopWuxRefresher('#wux-refresher', this, true)
            }

            _this.setData({
                meta:meta,
                dataList:[...datas]
            })
        })
        .catch(res=>{
            console.log(res,'---下拉刷新请求失败')
            // 停止当前下拉刷新
            $stopWuxRefresher()
        })
  },
  // 上拉加载更多
  onLoadmore() {
    console.log('>>>>>>>>>>>>>>>>>>>>>加载下一页', this.data.meta)
    if (this.data.meta.page_num < this.data.meta.total_page) {
      //获取列表信息
      const _this = this
      //请求下一页数据列表
      var params = {
        lot_code: this.data.lot_id,
        days:'-1',//查询天数:-1：全部 0：今天 1：昨天 2：近一周 3：近一月 4：近三月
        status:'-1',//状态:-1：全部 0：待出票 1：待开奖 2：已中奖 3：未中奖 4：截期未出票
        order_type:'0',//订单类型:0：普通订单 100：预付费订单 200：彩友多订单 300：口袋订单
        page_no: this.data.meta.page_num + 1,
        page_size: 10,
      }
      api.queryOrderList(params)
        .then(res => {
          const { meta, datas } = res.data
          datas&&datas.map(item=>{
            handleOneBetData(item)
          })

          if (meta.page_num < meta.total_page) {
            // 停止当前上拉加载
            $stopWuxLoader()
          } else {
            console.log('没有更多数据啦！！！且不能继续上拉操作')
            // 停止当前上拉加载（且不能继续上拉操作）
            $stopWuxLoader('#wux-refresher', this, true)
          }

          _this.setData({
            meta: meta,
            dataList: ~~meta.page_num === 1 ? [...datas] :
              [
                ..._this.data.dataList,
                ...datas
              ]
          })
        })
        .catch(res => {
          console.log('---上拉加载请求失败')
          // 停止当前上拉加载
          $stopWuxLoader()
        })
    }else{
       // 停止当前上拉加载（且不能继续上拉操作）
       $stopWuxLoader('#wux-refresher', this, true)
    }
  },
  toDetail:function(e){
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
        url: '/pages/detail/index?data='+ JSON.stringify(item)

    })
  }
})