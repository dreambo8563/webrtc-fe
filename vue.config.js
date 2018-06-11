const path = require("path")
const projectRoot = path.resolve(__dirname)
// module.exports = {
//   lintOnSave: false,
//   chainWebpack: config => {
//     config.merge({
//       // devServer: {
//       //   proxy: {
//       //     '/admin': 'http://api.gamesife.com'
//       //   }
//       // },
//       devServer: {
//         proxy: {
//           "/": {
//             target: "http://api.gamesife.com",
//             changeOrigin: true
//           }
//         }
//       }
//     });
//     config.plugins.delete("prefetch");
//     config.resolve.alias.set("@assets", path.join(projectRoot, "src/assets"));

//     // config.externals({
//     //   "element-ui": "Element"
//     // })
//     // config.resolve.alias.set("@assets", "http://www.baidu.com")
//     // config.module.rules.delete("images")

//     // add the new one
//     // config.module
//     //   .rule("images")
//     //   .test(/\.(png|jpe?g|gif)(\?.*)?$/)
//     //   .use("file")
//     //   .loader("file-loader")
//     //   .options({
//     //     name: "img/[name].[hash:8].[ext]"
//     //   })
//   }
// };

module.exports = {
  devServer: {
    proxy: "http://localhost:7000"
  },
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].favicon = "./public/favicon.ico"
      return args
    })
    config.plugins.delete("prefetch")
    config.resolve.alias.set("@assets", path.join(projectRoot, "src/assets"))

    // config.externals({
    //   "element-ui": "Element"
    // })
    // config.resolve.alias.set("@assets", "http://www.baidu.com")
    // config.module.rules.delete("images")

    // add the new one
    // config.module
    //   .rule("images")
    //   .test(/\.(png|jpe?g|gif)(\?.*)?$/)
    //   .use("file")
    //   .loader("file-loader")
    //   .options({
    //     name: "img/[name].[hash:8].[ext]"
    //   })
  }
}
