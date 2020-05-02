// 自己的router插件
// 1.实现一个Router类并挂载其实例
// 2.实现两个全局组件router-link和router-view
let Vue;
class VueRouter {
    // 核心任务
    // 1.监听url变化
    constructor(options) {
        this.$options = options;
        // 缓存path和route映射关系
        this.routeMap = {}
        this.$options.routes.forEach(route => {
            this.routeMap[route.path] = route
        })
        Vue.util.defineReactive(this, 'current', '')
        window.addEventListener('hashchange', this.onHashChange.bind(this))
        window.addEventListener('load', this.onHashChange.bind(this))

    }
    onHashChange() {
        console.log(window.location.hash);
        this.current = window.location.hash.slice(1) || '/';
        console.log(this);
    }
}
// 插件需要实现install方法
// 接受一个参数，Vue构造函数，主要用于数据响应式
VueRouter.install = function(_Vue) {
    // 保存Vue构造函数在VueRouter中使用
    Vue = _Vue;
    // 使用混入来做router挂载
    Vue.mixin({
        beforeCreate () {
            // 只有根实例才有router选项
            console.log('before'+this);
            if (this.$options.router) {
                Vue.prototype.$router = this.$options.router;
            }
        },
    })
    // 任务2：实现两个全局组件
    // router-link：生成一个a标签,在url后面添加#
    // <a href="#/about">aaaa</a>
    Vue.component('router-link', {
        props: {
            to: {
                type: String,
                required: true
            },
        },
        render(h) {
            return h('a',
                {attrs:{href:'#'+this.to}},
                this.$slots.default
            )
        }
    })
    Vue.component('router-view', {
        render(h) {
            // 根据current获取组件并render
            let component = null;
            const {routeMap, current} = this.$router;
            console.log('render', this.$router);
            if (routeMap[current]) {
                component = routeMap[current].component
            }
            return h(component)
        }
    })

    
}
export default VueRouter;
