export default [
  {
    type: 'select',
    key: 'job_type',
    data: []
  },
  {
    type: 'select',
    key: 'district_id',
    data: []
  },
  {
    type: 'radio',
    key: 'sort',
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
