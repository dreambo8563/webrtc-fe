import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      component: () => import("@/views/Home.vue")
    },
    {
      path: "*",
      name: "notfound",
      component: () => import("@/views/404.vue")
    }
  ]
});

// router.beforeEach(async (to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // this route requires auth, check if logged in
//     // if not, redirect to login page.

//     try {
//       const logined = await Auth.isLogined();
//       console.log(logined);
//       if (logined) {
//         // 如果判断是已登录情况,则继续
//         next();
//       } else {
//         // 假设这里的about页是未登录情况下跳转的地方
//         console.log("not authrized");
//         next({
//           path: PATH_LOGIN
//         });
//       }
//     } catch (error) {
//       console.log("get user auth 500");
//       // 如果请求报错,一般是500的时候,应该停留在当前页面
//       next(false);
//     }
//   } else {
//     next();
//   }
// });

export default router;
