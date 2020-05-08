// 数据响应式：Object.defineProperty()

function defineReative(obj, key, val) {
    // val可能是对象，需要递归
    observe(val)
    // 参数3是描述对象
    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key);
            return val;            
        },
        set(newVal) {
            if (newVal !== val) {
                console.log('set', key);
                // 防止newVal是对象，先做一次observe
                val = newVal;
            }
        }
    })
}

function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    Object.keys(obj).forEach(key => defineReative(obj, key, obj[key]))
}

function set(obj, key, val) {
    defineReative(obj, key, val)
}

const obj = {foo:'foo', bar: 'bar', baz: {a:1}}
observe(obj)

set(obj, 'dong', 'dong')
obj.dong