import { AppVersion } from '../../version'

export const config = {
  appkey: '8998E4346856493397DCAB2A04B74538',
  appName: '斗米找工作',
  versionName: AppVersion, // versionName为小程序的用户可见版本号
  versionCode: AppVersion, // versionCode为小程序的内部版本号，便于版本管理
  wxAppid: 'wxe1d7b959cd75eae2',
  getLocation: false, // 默认不获取用户位置
  autoOnPullDownRefresh: false, // 默认不统计下拉刷新数据
  autoOnReachBottom: false // 默认不统计页面触底数据
}
