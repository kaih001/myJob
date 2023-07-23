/*         上线前确保是线上环境         */
/*         上线前确保是线上环境         */
/*         上线前确保是线上环境         */

// 0:表示test环境 1:表示sim环境  2:表示online环境
const env = 2;

let api = {
  env: null,
};

// test环境
const TestAPI = {
  HOST_URL: "http://m-test.corp.doumi.com/api/mini/",
  ROP_HOST_URL: "https://rpo-test.corp.doumi.com/api/mini/client/",//jz-c-sim.doumi.com
};

// sim环境
const SimAPI = {
  HOST_URL: "http://m-sim.corp.doumi.com/api/mini/",
  ROP_HOST_URL: "https://rpo-sim.doumi.com/api/mini/client/",
  // HOST_URL: "http://jz-c-miniali-sim.doumi.com/api/mini/",
};

// online环境
const OnlineAPI = {
  HOST_URL: "https://m.doumi.com/api/mini/",
  ROP_HOST_URL: "https://rpo.doumi.com/api/mini/client/",
  // HOST_URL: "https://jz-c.doumi.com/api/mini/",//公网
};

if (env === 0) {
  api = TestAPI;
} else if (env === 1) {
  api = SimAPI;
} else if (env === 2) {
  api = OnlineAPI;
}

api.env = env;
api.TestAPI = TestAPI;
api.SimAPI = SimAPI;
api.OnlineAPI = OnlineAPI;

export default api;
