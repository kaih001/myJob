// console.log("script start");

// setTimeout(() => {
//   console.log("北歌");
// }, 1 * 2000);

// Promise.resolve()
//   .then(function () {
//     console.log("promise1");
//   })
//   .then(function () {
//     console.log("promise2");
//   });

// async function foo() {
//   await bar();
//   console.log("async1 end");
// }
// foo();

// async function errorFunc() {
//   try {
//     await Promise.reject("error!!!");
//   } catch (e) {
//     console.log(e);
//   }
//   console.log("async1");
//   return Promise.resolve("async1 success");
// }
// errorFunc().then((res) => console.log(res));

// function bar() {
//   console.log("async2 end");
// }

// console.log("script end");

// //script start
// //async2 end
// //script end
// //promise1
// //promise2(错误)
// //async1 end
// //error!!!
// //async1
// //async1 success
// //北歌

// console.log("1");

// setTimeout(() => {
//   console.log("2");
//   Promise.resolve().then(() => {
//     console.log("3");
//   });
//   new Promise((resolve) => {
//     console.log("4");
//     resolve();
//   }).then(() => {
//     console.log("5");
//   });
// });

// Promise.reject().then(
//   () => {
//     console.log("13");
//   },
//   () => {
//     console.log("12");
//   }
// );

// new Promise((resolve) => {
//   console.log("7");
//   resolve();
// }).then(() => {
//   console.log("8");
// });

// setTimeout(() => {
//   console.log("9");
//   Promise.resolve().then(() => {
//     console.log("10");
//   });
//   new Promise((resolve) => {
//     console.log("11");
//     resolve();
//   }).then(() => {
//     console.log("12");
//   });
// });

//1
//7
//12
//8
//2
//4
//9
//11
//3
//5
//10
//12

new Promise((resolve, reject) => {
  console.log(1);
  resolve();
})
  .then(() => {
    // 微1-1
    console.log(2);
    new Promise((resolve, reject) => {
      console.log(3);
      setTimeout(() => {
        // 宏2
        reject();
      }, 3 * 1000);
      resolve(); // TODO 注1
    })
      .then(() => {
        // 微1-2  TODO 注2
        console.log(4);
        new Promise((resolve, reject) => {
          console.log(5);
          resolve();
        })
          .then(() => {
            // 微1-4
            console.log(7);
          })
          .then(() => {
            // 微1-6
            console.log(9);
          });
      })
      .then(() => {
        // 微1-5 TODO 注3
        console.log(8);
      });
  })
  .then(() => {
    // 微1-3
    console.log(6);
  });

//1
//2
//3
//4
//5
//6
//7
//8
//9
