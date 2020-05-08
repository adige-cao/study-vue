// 任务：
// 1. 数据响应式：是data选项中的对象编程响应式的
// 2. 模板编译：对模板解析，找到其中动态绑定（即依赖关系），初始化他们并创建更新函数

// 数据响应式：
// Object.defineProperty()


function defineReactive(obj, key, val) {

    // val可能还是对象，此时我们需要递归
    observe(val)
  
    // 创建Dep实例，他和key一对一对应关系
  
    // 参数3是描述对象
    Object.defineProperty(obj, key, {
      get() {
        console.log('get', key);
        // 依赖收集:Dep.target就是当前新创建Watcher实例

        return val
      },
      set(newVal) {
        if (newVal !== val) {
          console.log('set', key);
          // 防止newVal是对象，提前做一次observe
          observe(newVal)
          val = newVal
  

        }
      }
    })
  }
  
  function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return
    }
  
    // 响应式
    new Observer(obj)
  
  }
  
  // Observer: 辨别当前对象类型是纯对象还是数组，从而做不同响应式操作
  class Observer {
    constructor(value) {
      this.value = value
      // 辨别类型
      if (Array.isArray(value)) {
        // todo
      } else {
        this.walk(value)
      }
    }
  
    walk(obj) {
      // 对象响应式
      Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
    }
  }
  
  // 代理函数：可以将$data代理到KVue的实例
  // vm是KVue实例
  function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
      // 为当前实例做代理，定义一些key和data相对应
      Object.defineProperty(vm, key, {
        get() {
          return vm.$data[key]
        },
        set(newVal) {
          vm.$data[key] = newVal
        }
      })
    })
  }
  
  // KVue：解析选项，响应式、编译等等
  class KVue {
      constructor(options) {
          this.$options = options;
          this.$data = options.$data;
          observe(this.$data);
          proxy(this);
      }
  }