import { yearRange } from '../utils/date'

export const YEARS = (() => {
  const startYear = new Date().getFullYear() - 56
  const endYear = new Date().getFullYear() - 16
  return yearRange(startYear, endYear)
})()

// 是否学生
export const AT_SCHOOL = [
  { value: 0, label: '非学生' },
  { value: 1, label: '学生' }
]

// 学历
export const DEGREES = [
  { value: 0, label: '初中以下' },
  { value: 6, label: '初中' },
  { value: 1, label: '高中' },
  { value: 7, label: '中专' },
  { value: 2, label: '大专' },
  { value: 3, label: '本科' },
  { value: 4, label: '硕士' },
  { value: 5, label: '博士及以上' }
]

// 性别
export const GENDER = [
  { value: 1, label: '男' },
  { value: 2, label: '女' }
]

// 求职类型
export const JOB_DATE_TYPE = [
  { value: 0, label: '不限' },
  { value: 1, label: '兼职' },
  { value: 2, label: '全职' }
]

// 当前状态
export const JOB_HUNTING_STATUS = [
  { value: 1, label: '积极找工作' },
  { value: 2, label: '随便看看' },
  { value: 3, label: '暂时不找工作' }
]

// 工作经验
export const WORK_YEARS = [
  { value: 1, label: '应届毕业生' },
  { value: 2, label: '三年及以下' },
  { value: 3, label: '3-5年' },
  { value: 4, label: '5-10年' },
  { value: 5, label: '10年以上' }
]

// 约面签到调研框没去原因
export const REASONS = [
  { value: 1, label: '临时有事' },
  { value: 2, label: '无人联系我' },
  { value: 3, label: '已找到工作' },
  { value: 4, label: '职位不合适' },
  { value: 5, label: '联系不上' },
  { value: 6, label: '距离远' },
  { value: 7, label: '薪资待遇低' },
  { value: 8, label: '工作时间不符合' },
  { value: 9, label: '工作内容不符合' }
]
