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
                console.log(newVal);
                console.log(val);
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

const obj = {foo:'foo', bar: 'bar', baz: {a:1}}
observe(obj)

obj.baz.a = '10'