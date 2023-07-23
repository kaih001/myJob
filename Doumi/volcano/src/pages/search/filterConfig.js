export default [
  {
    type: 'select',
    key: 'job_date_type',
    data: [
      { label: '推荐职位', value: '0' },
      { label: '全职', value: '2' },
      { label: '兼职', value: '1' }
    ]
  },
  {
    type: 'select',
    key: 'district_id',
    data: [{ label: '全城', value: 0 }]
  },
  {
    type: 'radio',
    key: 'order',
    data: { label: '离我最近', value: '1' }
  },
  {
    type: 'checkbox-group',
    data: [
      {
        key: 'sex',
        title: '性别要求',
        data: [
          { label: '全部', value: '0' },
          { label: '男生可做', value: '1' },
          { label: '女生可做', value: '2' }
        ],
      },
      {
        key: 'identity',
        title: '身份要求',
        data: [
          { label: '全部', value: '0' },
          { label: '学生可做', value: '1' },
          { label: '非学生可做', value: '3' }
        ]
      }
    ]
  }
]
