// 目标1:实现Store类,管理state(响应式的),commit方法和dispatch方法
// 目标2:封装一个插件,使用更容易
let Vue;

class Store {
    constructor(options) {
        // 定义响应式的state
        this._vm = new Vue({
            data: {
                $$state: options.state
                
            },
            // computed: {
                
            //     getters() {
                    
            //         options.getters.forEach(key => {
                        
                        
            //             return options.getters[key]($$state);
            //         })
            //     }
            // },
            watch: {
                $$state: {
                    
                    immediate: true,
                    handler(newValue, oldValue) {
                        options.getters.forEach(key => {
                        
                            return options.getters[key](newValue)
                        })
                    }
                }
            },
        })
        
        this._mutations = options.mutations;
        this._actions = options.actions;
        // 绑定this指向
        this.commit = this.commit.bind(this);
        this.dispatch = this.dispatch.bind(this);
        // 实现getters
        // this.getters = {}
        // // 遍历所有getters,传递state使其是响应式的,返回计算结果
        // Object.keys(options.getters).forEach(key => {
        //     Object.defineProperty(this.getters, key, {
        //         get: () => {
        //             return options.getters[key](this.state)
        //         },
        //         // 保证getters对象可枚举
        //         enumerable: true
        //     })
        // })
    }
    // 使state对用户只读
    get state() {
        return this._vm._data.$$state;
    }

    set state(val) {
        console.log('不能直接赋值呀,请换别的方式!!天王盖地虎!!');
        
    }
    // 实现commit方法,可以修改state
    commit(type, payload) {
        const entry = this._mutations[type];
        if (!entry) {
            console.log('未知mutation类型');
            return
        }
        entry(this.state, payload)
    }

    dispatch(type, payload) {
        const entry = this._actions[type]
        if(!entry) {
            console.log('未知action类型');
            return
        }
        console.log(this);
        
        entry(this, payload)
    }
}

function install(_Vue) {
    Vue = _Vue;
    Vue.mixin({
        beforeCreate () {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}

export default { Store, install }