// 任务：
// 1. 数据响应式：是data选项中的对象编程响应式的
// 2. 模板编译：对模板解析，找到其中动态绑定（即依赖关系），初始化他们并创建更新函数

// 数据响应式：
// Object.defineProperty()


function defineReactive(obj, key, val) {

    // val可能还是对象，此时我们需要递归
    observe(val)
    // 创建Dep实例，他和key一对一对应关系
    const dep = new Dep()
    // 参数3是描述对象
    Object.defineProperty(obj, key, {
      get() {
        // console.log('get', key);
        // 依赖收集:Dep.target就是当前新创建Watcher实例
        Dep.target && dep.addDep(Dep.target)
        return val
      },
      set(newVal) {
        if (newVal !== val) {
          console.log('set', key);
          // 防止newVal是对象，提前做一次observe
          observe(newVal)
          val = newVal
          // 通知更新
          dep.notify()
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
          this.$data = options.data;
          observe(this.$data);
          proxy(this);
          // 执行编译
          new Compile(options.el, this)
      }
  }

  // Compile:遍历视图模板，解析其中的特殊模板语法为更新函数
  class Compile {
    constructor(el, vm) {
      this.$vm = vm;
      this.$el = document.querySelector(el);
      // 执行编译
      this.compile(this.$el)
    }
    compile(el) {
      // 遍历子元素，判断他们类型并做相应处理
      el.childNodes.forEach(node => {
        // 判断类型
        if (node.nodeType === 1) {
          // 元素节点
          // console.log('编译元素', node.nodeName);
          this.compileElement(node)
          
        } else if (this.isInter(node)) {
          // console.log('文本节点', node.textContent);
          // 暗号：double kill
          this.compileText(node)
        }
        // 递归子节点
        if (node.childNodes) {
          this.compile(node) //为什么是node?
        }
      })
    }
    // 是否插值绑定
    isInter(node) {
      return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    // 绑定表达式的解析
    compileText(node) {
      // 获取匹配表达式RegExp.$1
      // node.textContent = this.$vm[RegExp.$1]
      this.update(node, RegExp.$1, 'text')
    }
    // 编译元素节点：判断指令和事件
    compileElement(node) {
      // 获取属性
      const attrs = node.attributes;
      Array.from(attrs).forEach(attr => {
        // attr是一个对象{name:'k-text', value: 'counter'}
        const {name, value} = attr
        // 判断是否是指令
        if (name.indexOf('k-') === 0) {
          // 截取指令
          const dir = name.substring(2)
          // 执行指令
          this[dir] && this[dir](node, value)
        } else if (name.indexOf('@click') === 0) {
          // const command = name bind(this.$vm)
          const dir = name.substring(1)
          this[dir] && this[dir](node, value)
        }
      })
      
    }
    // 文本更新
    text(node, exp) {
      this.update(node, exp, 'text')
    }
    html(node, exp) {
      this.update(node, exp, 'html')
      
    }
    click(node, exp) {
      this.update(node, exp, 'click')
    }
    // update方法
    update(node, exp, dir) {
      // 获取更新方法
      const fn = this[dir + 'Updater']
      fn && fn(node, this.$vm[exp])
      // 创建Watcher实例
      new Watcher(this.$vm, exp, val => {
        fn && fn(node, val)   // 不太懂，val是回调函数给的？
      })
    }
    // dom执行方法
    textUpdater(node, value) {
      node.textContent = value
    }
    htmlUpdater(node, value) {
      node.innerHTML = value
    }
    clickUpdater(node, value) {
      
    }

  
  }
  // Watcher:管理依赖，执行更新
  class Watcher {
    // vm是KVue实例，key是data中对应key的名称，fn是更新函数
    constructor(vm, key, fn) {
      this.vm = vm
      this.key = key
      this.fn = fn
      // 简历dep和watcher之间的关系
      Dep.target = this
      this.vm[this.key]
      Dep.target = null
    }
    // 更新函数，有Dep调用
    update() {
      // 更新函数调用，设置上下文为KVue实例，传参当前最新值
      this.fn.call(this.vm, this.vm[this.key])
    }
  }
  // Dep: 管理多个watcher实例，当对应key发生变化时，通知他们更新
  class Dep {
    constructor() {
      this.deps = []
    }
    addDep(dep) {
      // 添加订阅者，dep就是watcher实例
      this.deps.push(dep)
    }
    // 通知更新
    notify() {
      this.deps.forEach(w=>w.update())
    }
  }