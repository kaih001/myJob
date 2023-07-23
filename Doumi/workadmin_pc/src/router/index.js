import Vue from 'vue'
import Router from 'vue-router'
//项目
// import Applications from '@/components/Applications'//项目详情页title及侧边栏
// import Overviews from '@/components/Overviews'//项目概览主页
// import Project from '@/components/Project'//项目列表页
// import Kqaddmin from '@/components/Kqaddmin'//考勤管理主页
// import Notdefined from '@/components/Notdefined'//404页面
// import Kqtasklist from '@/components/Kqtasklist'//考勤任务列表页
// import Kqsettask from '@/components/Kqsettask'//添加/修改 考勤任务
// import Kqeditpb from '@/components/Kqeditpb'//考勤编辑排班
// import Memberadmin from '@/components/Memberadmin'//人员管理主页
// import Membererror from '@/components/Membererror'
// import Memberset from '@/components/Memberset'//人员管理设置页
// import Memberinfo from '@/components/Memberinfo'//人员管理个人信息页
// import Invitationmember from '@/components/Invitationmember'//邀请人员
// import PayrollAccounting from '@/components/PayrollAccounting'
// import CreateEditPayroll from '@/components/CreateEditPayroll'
// import PaylistDetail from '@/components/PaylistDetail'
// import SetPayroll from '@/components/SetPayroll'
// import CreateEditError from '@/components/CreateEditError'
// import CustomerConfirms from '@/components/CustomerConfirms'
// import CustomerConfirm from '@/components/CustomerConfirm'
// import CustomerRefused from '@/components/CustomerRefused'
// import KqConfirm from '@/components/KqConfirm'
// import Positionlocation from '@/components/Positionlocation'  //新版位置监控首页
// import Positionmap from '@/components/Positionmap'  //新版位置监控和轨迹页面
// import Positionmonitor from '@/components/Positionmonitor'  //位置监控首页
// import Positiondetails from '@/components/Positiondetails'  //位置监控详情页
// import Positionset from '@/components/Positionset'  //位置监控设置页
// import Customerconfirmpage from '@/components/Customerconfirmpage'  //客户确认页
// import Newcreatmail from '@/components/Newcreatmail'  //客户确认--新建确认邮件
// import ProjectSet from '@/components/ProjectSet'  //项目设置
//统计
// import Statistics from '@/components/Statistics'
// import TJrecruit from '@/components/TJrecruit'
// import TJactive from '@/components/TJactive'
// import TJproject from '@/components/TJproject'
// import InsuranceM from '@/components/InsuranceManagement'
// import InsuranceS from '@/components/InsuranceStatistical'
// import InsuranceMer from '@/components/InsuranceMember'
// import Insurancetxt from '@/components/Insurancetxt'  //保险《投保须知》
// import Insurancecompany from '@/components/Insurancecompany'  //免费体验企业用工保
// import Kqeditygpb from '@/components/Kqeditygpb'  //免费体验企业用工保
// import Kqpbmemberlist from '@/components/Kqpbmemberlist'  //免费体验企业用工保
// import KqeditRanking from '@/components/KqeditRanking'  //免费体验企业用工保
Vue.use(Router)

export default new Router({
	// mode: 'history',
	routes: [
		{
			path: '',
			redirect: '/project',
			component: (resolve) => require(['@/components/Project'], resolve)
		},
		{
			path: '/project',
			name: 'Project',
			component: (resolve) => require(['@/components/Project'], resolve)
		},
		{
			path: '/CustomerConfirms',
			name: 'CustomerConfirms',
			component: (resolve) => require(['@/components/CustomerConfirms'], resolve)
		},
		{
			path: '/insurancetxt',
			name: 'Insurancetxt',
			component: (resolve) => require(['@/components/Insurancetxt'], resolve)
		},
		{
			path: '/insurancecompany',
			name: 'Insurancecompany',
			component: (resolve) => require(['@/components/Insurancecompany'], resolve)
		},
		// {
		// 	path: '/CustomerConfirm',
		// 	name: 'CustomerConfirm',
		// 	component: CustomerConfirm,
		// },
		{
			path: '/CustomerRefused',
			name: 'CustomerRefused',
			component: (resolve) => require(['@/components/CustomerRefused'], resolve)
		},
		{
			path: '/PayListCheck',
			name: 'PayListCheck',
			component: (resolve) => require(['@/components/PayListCheck'], resolve)
		},
		{
			path: '/project/:projectId',
			// name: 'Applications',
			component: (resolve) => require(['@/components/Applications'], resolve),
			children: [
				{
					path: '',
					redirect: 'overviews',
					component: (resolve) => require(['@/components/Overviews'], resolve)
				},
				{
					path: 'overviews',
					name: 'Overviews',
					component: (resolve) => require(['@/components/Overviews'], resolve)
				},
				{
					path: 'projectdetail',
					name: 'projectdetail',
					component: (resolve) => require(['@/components/Projectdetail'], resolve)
				},
				{
					path: 'kqaddmin',
					name: 'Kqaddmin',
					component: (resolve) => require(['@/components/Kqaddmin'], resolve)
				},
				{
					path: 'kqtasklist',
					name: 'Kqtasklist',
					component: (resolve) => require(['@/components/Kqtasklist'], resolve)
				},
				{
					path: 'kqsettask',
					name: 'Kqsettask',
					component: (resolve) => require(['@/components/Kqsettask'], resolve)
				},
				{
					path: 'kqeditpb',
					name: 'Kqeditpb',
					component: (resolve) => require(['@/components/Kqeditpb'], resolve)
				},
				{
					path: 'kqeditygpb',
					name: 'Kqeditygpb',
					component: (resolve) => require(['@/components/Kqeditygpb'], resolve)
				},
				{
					path: 'Kqpbmemberlist',
					name: 'Kqpbmemberlist',
					component: (resolve) => require(['@/components/Kqpbmemberlist'], resolve)
				},
				{
					path: 'KqeditRanking',
					name: 'KqeditRanking',
					component: (resolve) => require(['@/components/KqeditRanking'], resolve)
				},
				{
					path: 'memberadmin',
					name: 'Memberadmin',
					component: (resolve) => require(['@/components/Memberadmin'], resolve)
				},
				{
					path: 'membererror',
					name: 'Membererror',
					component: (resolve) => require(['@/components/Membererror'], resolve)
				},
				{
					path: 'memberset',
					name: 'Memberset',
					component: (resolve) => require(['@/components/Memberset'], resolve)
				},
				{
					path: 'memberinfo',
					name: 'Memberinfo',
					component: (resolve) => require(['@/components/Memberinfo'], resolve)
				},
				{
					path: 'invitationmember',
					name: 'Invitationmember',
					component: (resolve) => require(['@/components/Invitationmember'], resolve)
				},
				{
					path: 'PayrollAccounting',
					component: (resolve) => require(['@/components/PayrollAccounting'], resolve)
				},
				{
					path: 'PayResultDown',
					name: 'PayResultDown',
					component: (resolve) => require(['@/components/PayResultDown'], resolve)
				},
				{
					path: 'PaydayReport',
					component: (resolve) => require(['@/components/PaydayReport'], resolve)
				},
				{
					path: 'CreateEditPayroll',
					component: (resolve) => require(['@/components/CreateEditPayroll'], resolve)
				},
				{
					path: 'CreateEditPayrollCost',
					component: (resolve) => require(['@/components/CreateEditPayrollCost'], resolve)
				},
				{
					path: 'PaylistDetail',
					name: 'PaylistDetail',
					component: (resolve) => require(['@/components/PaylistDetail'], resolve)
				},

				{
					path: 'EditPayrollDeduct',
					name: 'EditPayrollDeduct',
					component: (resolve) => require(['@/components/EditPayrollDeduct'], resolve)
				},
				{
					path: 'setpayroll',
					name: 'SetPayroll',
					component: (resolve) => require(['@/components/SetPayroll'], resolve)
				},
				{
					path: 'CreateEditError',
					name: 'CreateEditError',
					component: (resolve) => require(['@/components/CreateEditError'], resolve)
				},
				{
					path: 'positionlocation',
					name: 'Positionlocation',
					component: (resolve) => require(['@/components/Positionlocation'], resolve)
				},
				{
					path: 'positionmap',
					name: 'Positionmap',
					component: (resolve) => require(['@/components/Positionmap'], resolve)
				},
				// {
				// 	path: 'positionmonitor',
				// 	name: 'Positionmonitor',
				// 	component: Positionmonitor,
				// },
				// {
				// 	path: 'positiondetails',
				// 	name: 'Positiondetails',
				// 	component: Positiondetails,
				// },
				{
					path: 'positionset',
					name: 'Positionset',
					component: (resolve) => require(['@/components/Positionset'], resolve)
				},
				{
					path: 'KqConfirm',
					name: 'KqConfirm',
					component: (resolve) => require(['@/components/KqConfirm'], resolve)
				},
				{
					path: 'customerconfirmpage',
					name: 'Customerconfirmpage',
					component: (resolve) => require(['@/components/Customerconfirmpage'], resolve)
				},
				{
					path: 'newcreatmail',
					name: 'Newcreatmail',
					component: (resolve) => require(['@/components/Newcreatmail'], resolve)
				},
				{
					path: 'newDailywage',
					name: 'NewDailywage',
					component: (resolve) => require(['@/components/NewDailywage'], resolve)
				},
				{
					path: 'fullTimeConfirm',
					name: 'FullTimeConfirm',
					component: (resolve) => require(['@/components/FullTimeConfirm'], resolve)
				},
				{
					path: 'fullTimeCreatMail',
					name: 'FullTimeCreatMail',
					component: (resolve) => require(['@/components/FullTimeCreatMail'], resolve)
				},
				{
					path: 'fullTimeCreateEditPayroll',
					name: 'FullTimeCreateEditPayroll',
					component: (resolve) => require(['@/components/FullTimeCreateEditPayroll'], resolve)
				},

				{
					path: 'insuranceM',
					name: 'InsuranceManagement',
					component: (resolve) => require(['@/components/InsuranceManagement'], resolve)
				},
				{
					path: 'insuranceS',
					name: 'InsuranceStatistical',
					component: (resolve) => require(['@/components/InsuranceStatistical'], resolve)
				},
				{
					path: 'insuranceMer',
					name: 'InsuranceMember',
					component: (resolve) => require(['@/components/InsuranceMember'], resolve)
				},
				{
					path: 'insuranceMembererror',
					name: 'insuranceMembererror',
					component: (resolve) => require(['@/components/insuranceMembererror'], resolve)
				},
				{
					path: 'projectset',
					name: 'ProjectSet',
					component: (resolve) => require(['@/components/ProjectSet'], resolve)
				},
				{
					path: 'socialSecurity',
					name: 'SocialSecurity',
					component: (resolve) => require(['@/components/SocialSecurity'], resolve)
				},
				{
					path: 'ssSafing',
					name: 'ssSafing',
					component: (resolve) => require(['@/components/ssSafing'], resolve)
				},
				{
					path: 'ssTab',
					name: 'ssTab',
					component: (resolve) => require(['@/components/ssTab'], resolve)
				},
				// {
				// 	path: 'ssTabPre',
				// 	name: 'ssTabPre',
				// 	component: (resolve) => require(['@/components/ssTabPre'], resolve)
				// },
				// {
				// 	path: 'ssTabIn',
				// 	name: 'ssTabIn',
				// 	component: (resolve) => require(['@/components/ssTabIn'], resolve)
				// },
				// {
				// 	path: 'ssTabStop',
				// 	name: 'ssTabStop',
				// 	component: (resolve) => require(['@/components/ssTabStop'], resolve)
				// },
				// {
				// 	path: 'ssTabBill',
				// 	name: 'ssTabBill',
				// 	component: (resolve) => require(['@/components/ssTabBill'], resolve)
				// },
				{
					path: 'salary',
					name: 'Salary',
					component: (resolve) => require(['@/components/Salary'], resolve)
				},
				{
					path: 'ssDetails',
					name: 'SsDetails',
					component: (resolve) => require(['@/components/SsDetails'], resolve)
				},
				{
					path: 'demo',
					name: 'Demo',
					component: (resolve) => require(['@/components/Demo'], resolve)
				},
				{
					path: 'newLaborInsurance',
					name: 'newLaborInsurance',
					component: (resolve) => require(['@/components/newLaborInsurance/index'], resolve)
				},
				{
					path: 'insuranceAddPerson',
					name: 'insuranceAddPerson',
					component: (resolve) => require(['@/components/newLaborInsurance/childpage/addPerson'], resolve)
				},
				{
					path: 'insuranceReductPerson',
					name: 'insuranceReductPerson',
					component: (resolve) => require(['@/components/newLaborInsurance/childpage/reductPerson'], resolve)
				},
				{
					path: 'DepartureManage',
					name: 'DepartureManage',
					component: (resolve) => require(['@/components/DepartureManage'], resolve)
				},
				{
					path: 'salaryadvances',
					name: 'Salaryadvances',
					component: (resolve) => require(['@/components/salaryAdvances'], resolve)
				},
			]
		},
		{
			path: '/statistics',
			// name: 'Statistics',
			component: (resolve) => require(['@/components/Statistics'], resolve),
			children: [
				{
					path: '',
					redirect: 'tjrecruit',
					component: (resolve) => require(['@/components/TJrecruit'], resolve)
				},
				{
					path: 'tjrecruit',
					name: 'TJrecruit',
					component: (resolve) => require(['@/components/TJrecruit'], resolve)
				},
				{
					path: 'tjactive',
					name: 'TJactive',
					component: (resolve) => require(['@/components/TJactive'], resolve)
				},
				{
					path: 'tjproject',
					name: 'TJproject',
					component: (resolve) => require(['@/components/TJproject'], resolve)
				},
				{
					path: 'tjpackage',
					name: 'TJpackage',
					component: (resolve) => require(['@/components/TJpackage'], resolve)
				}
			]
		},
		{
			path: '/investigation',
			name: 'investigation',
			component: (resolve) => require(['@/components/investigation'], resolve)
		},
		{
			path: '/violation',
			name: 'violation',
			component: (resolve) => require(['@/components/violation'], resolve)
		},
		{
			path: '*',
			// redirect: '/notdefined',
			component: (resolve) => require(['@/components/Notdefined'], resolve)
		},
	]
})