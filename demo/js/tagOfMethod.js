var //全局常量
TAG_CODE_ERROR = 0x0, //错误
TAG_CODE_STATUS = 0x1, //正确
TAG_CODE_FIND = 0x2, //成功找到资源、路径、方法
TAG_CODE_NOTFIND = 0x3, //找不到资源、路径、方法
TAG_CHAR_split = '/', //分隔符
TAG_SELECT_root = '@', //根目录选择器
TAG_SELECT_all = '*', //通配符选择器
TAG_RULE_tag = 0x1, //标签名
TAG_RULE_attr = 0x2, //属性
TAG_RULE_attr_name = 0x1, //属性名
TAG_RULE_attr_value = 0x2, //属性值
TAG_RULE_child = 0x3, //子节点
TAG_RULE_ID = 0x4, //唯一标识
TAG_RULE_parent_tag = 0x5, //父元素标签名
TAG_RULE_parent_attr = 0x6; //父元素属性
var //全局变量
Tag_ID = 0, //缓存的索引
Tag_ID_Cache = {}; //缓存
function Tag(name, attr, child) {
    if (name === void 0) { name = ''; }
    if (attr === void 0) { attr = {}; }
    if (child === void 0) { child = []; }
    this.name = name;
    this.attr = attr;
    this.child = child;
    this.id = Tag_ID;
    Tag_ID_Cache[Tag_ID++] = this;
    child && (function (self) {
        var len = self.child.length, i = 0;
        while (i < len) {
            self.child[i].parent = self;
            self.child[i].index = i++;
        }
    })(this);
}
Tag.prototype = {
    /**
     * 添加元素到子节点的末尾
     * @param tag 字符串或Tag
     */
    appendChild: function (tag) {
        tag.index = this.child.length;
        tag.parent = this; //为子节点添加父节点索引
        this.child.push(tag);
    },
    /**
     * 插入元素到子节点
     * @param tag 字符串或Tag
     * @param index 插入位置，默认插入到开头值为0
     */
    insertChild: function (tag, index) {
        if (index === void 0) { index = 0; }
        tag.index = index++;
        tag.parent = this; //为子节点添加父节点索引
        index == 0 ? this.child.unshift(tag) : this.child.splice(index - 1, 0, tag);
        var len = this.child.length;
        while (index < len) {
            this.child[index].index = index++;
        }
    },
    /**
     * 删除子节点
     * @param index 要删除的索引
     */
    removeChild: function (index) {
        if (index === void 0) { index = this.child.length - 1; }
        index == 0 ? this.child.shift() : index == this.child.length - 1 ? this.child.pop() : this.child.splice(index, 1);
        var len = this.child.length;
        while (index < len) {
            this.child[index].index = index++;
        }
    },
    /**
     * 替换节点
     * @param tag 替换的节点
     * @param index 替换的索引，默认为0
     * @param remove 替换的个数，默认为1
     */
    replaceChild: function (tag, index, remove) {
        if (index === void 0) { index = 0; }
        if (remove === void 0) { remove = 1; }
        tag.index = index;
        tag.parent = this; //为子节点添加父节点索引
        this.child.splice(index, remove, tag);
        if (remove != 1) {
            var len = this.child.length;
            while (index < len) {
                this.child[index].index = index++;
            }
        }
    }
};
function TagUtil() {
    var Tag_Rule = {
        '@': {
            '#': {
                'tag': {
                    '*': ['<!-- ', TAG_RULE_child, ' -->']
                },
                'attr': {
                    '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
                }
            },
            'style': {
                'tag': {
                    '*': [TAG_RULE_tag, '{', TAG_RULE_attr, '}']
                },
                'attr': {
                    '*': [' ', TAG_RULE_attr_name, ': ', TAG_RULE_attr_value, ';']
                }
            },
            'tag': {
                'br': ['<', TAG_RULE_tag, '/>'],
                'hr': ['<', TAG_RULE_tag, TAG_RULE_attr, '/>'],
                'link': ['<', TAG_RULE_tag, TAG_RULE_attr, '/>'],
                'img': ['<', TAG_RULE_tag, TAG_RULE_attr, '/>'],
                'input': ['<', TAG_RULE_tag, TAG_RULE_attr, '/>'],
                'meta': ['<', TAG_RULE_tag, TAG_RULE_attr, '/>'],
                '#': ['<!-- ', TAG_RULE_child, ' -->'],
                '*': ['<', TAG_RULE_tag, TAG_RULE_attr, '>', TAG_RULE_child, '</', TAG_RULE_tag, '>']
            },
            'attr': {
                '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
            }
        }
    }, Tag_Rule_Cache = {}; //缓存
    function formatTag(obj, rule, parent_rule) {
        var i = 0, arr = [], rule_tag = rule.tag, rule_attr = rule.attr, obj_attr = obj.attr, obj_child = obj.child, obj_name = obj.name.split(TAG_CHAR_split);
        while (i < rule_tag.length) {
            switch (rule_tag[i]) {
                case TAG_RULE_tag:
                    arr.push(obj_name[obj_name.length - 1]);
                    break;
                case TAG_RULE_attr:
                    for (var k in obj_attr) {
                        var attr = [];
                        for (var j = rule_attr.length; j--;) {
                            switch (rule_attr[j]) {
                                case TAG_RULE_attr_name:
                                    attr.unshift(k);
                                    break;
                                case TAG_RULE_attr_value:
                                    attr.unshift(obj_attr[k]);
                                    break;
                                default:
                                    attr.unshift(rule_attr[j]);
                            }
                        }
                        arr.push(attr.join(''));
                    }
                    break;
                case TAG_RULE_child:
                    var child = [];
                    for (var j = obj_child.length; j--;) {
                        child.unshift(tagOfMethod(obj_child[j]));
                    }
                    arr.push(child.join(''));
                    break;
                case TAG_RULE_ID:
                    arr.push(obj.id);
                    break;
                case TAG_RULE_parent_tag:
                    if (obj.parent) {
                        var obj_name_1 = obj.parent.name.split(TAG_CHAR_split);
                        arr.push(obj_name_1[obj_name_1.length - 1]);
                    }
                    break;
                case TAG_RULE_parent_attr:
                    if (obj.parent && parent_rule) {
                        var obj_attr_1 = obj.parent.attr, rule_attr_1 = parent_rule.attr;
                        for (var k in obj_attr_1) {
                            var attr = [];
                            for (var j = rule_attr_1.length; j--;) {
                                switch (rule_attr_1[j]) {
                                    case TAG_RULE_attr_name:
                                        attr.unshift(k);
                                        break;
                                    case TAG_RULE_attr_value:
                                        attr.unshift(obj_attr_1[k]);
                                        break;
                                    default:
                                        attr.unshift(rule_attr_1[j]);
                                }
                            }
                            arr.push(attr.join(''));
                        }
                    }
                    break;
                default:
                    arr.push(rule_tag[i]);
            }
            i++;
        }
        return arr.join('');
    }
    function findRule(tagName, rule) {
        var arr = tagName.split(TAG_CHAR_split), path = rule, flag = TAG_CODE_NOTFIND, obj = { tag: {}, attr: {} };
        for (var t = arr.length, i = 0; t--; i++) {
            if (t != 0) {
                if (path[arr[i]]) {
                    path = path[arr[i]];
                }
                else if (path[TAG_SELECT_root]) {
                    if (path[TAG_SELECT_root][arr[i]]) {
                        path = path[TAG_SELECT_root][arr[i]];
                    }
                    else if (path[TAG_SELECT_root][TAG_SELECT_all]) {
                        path = path[TAG_SELECT_root][TAG_SELECT_all];
                    }
                }
                else if (path[TAG_SELECT_all]) {
                    path = [TAG_SELECT_all];
                }
                else {
                    console.log("@root\u4E0B\u65E0\u6CD5\u627E\u5230" + tagName + arr[i] + "\u7684\u89C4\u5219");
                    break;
                }
            }
            else {
                var str = 'tag';
                if (path[str] && path[str][arr[i]]) {
                    obj[str] = path[str][arr[i]];
                }
                else if (path[TAG_SELECT_root] && path[TAG_SELECT_root][str]) {
                    if (path[TAG_SELECT_root][str][arr[i]]) {
                        obj[str] = path[TAG_SELECT_root][str][arr[i]];
                    }
                    else if (path[TAG_SELECT_root][str][TAG_SELECT_all]) {
                        obj[str] = path[TAG_SELECT_root][str][TAG_SELECT_all];
                    }
                    else {
                        console.log("@root\u4E0B\u65E0\u6CD5\u627E\u5230" + tagName + "\u7684tag\u89C4\u5219");
                        break;
                    }
                }
                else if (path[str] && path[str][TAG_SELECT_all]) {
                    obj[str] = path[str][TAG_SELECT_all];
                }
                else {
                    console.log("\u65E0\u6CD5\u627E\u5230" + tagName + "\u7684tag\u89C4\u5219");
                    break;
                }
                //attr规则
                str = 'attr';
                if (path[str] && path[str][arr[i]]) {
                    obj[str] = path[str][arr[i]];
                }
                else if (path[TAG_SELECT_root] && path[TAG_SELECT_root][str]) {
                    if (path[TAG_SELECT_root][str][arr[i]]) {
                        obj[str] = path[TAG_SELECT_root][str][arr[i]];
                    }
                    else if (path[TAG_SELECT_root][str][TAG_SELECT_all]) {
                        obj[str] = path[TAG_SELECT_root][str][TAG_SELECT_all];
                    }
                    else {
                        console.log("@root\u4E0B\u65E0\u6CD5\u627E\u5230" + tagName + "\u7684attr\u89C4\u5219");
                        break;
                    }
                }
                else if (path[str] && path[str][TAG_SELECT_all]) {
                    obj[str] = path[str][TAG_SELECT_all];
                }
                else {
                    console.log("\u65E0\u6CD5\u627E\u5230" + tagName + "\u7684attr\u89C4\u5219");
                    break;
                }
                flag = TAG_CODE_FIND;
            }
        }
        return [flag, obj];
    }
    function tagOfMethod(obj) {
        if (typeof obj == 'string')
            return obj;
        if (obj instanceof Tag) {
            var tagName = obj.name, tagPName = void 0, tagPRule = void 0;
            var tagRule = Tag_Rule_Cache[tagName];
            // console.log(obj.name)
            if (!tagRule) {
                var find = findRule(tagName, Tag_Rule);
                // console.log(find)
                if (find[0] == TAG_CODE_FIND) {
                    tagRule = find[1];
                }
                else {
                    return "\u627E\u4E0D\u5230" + tagName;
                }
            }
            if (obj.parent) {
                tagPName = obj.parent.name;
                tagPRule = Tag_Rule_Cache[tagPName];
                // console.log(obj.name)
                if (!tagPRule) {
                    var find = findRule(tagPName, Tag_Rule);
                    // console.log(find)
                    if (find[0] == TAG_CODE_FIND) {
                        tagPRule = find[1];
                    }
                    else {
                        return "\u627E\u4E0D\u5230" + tagPName;
                    }
                }
            }
            // obj['uuid']=uuid;
            // cache[uuid]=obj;
            // return `<model id='${uuid++}'>${formatTag(obj, tagRule)}</model>`;
            return formatTag(obj, tagRule, tagPRule);
        }
        return '格式错误';
    }
    this.parseJSON = function (params) {
        var tag = JSON.parse(params, function (key, value) {
            switch (key) {
                case "child":
                    var arr = [];
                    for (var i = 0, t = value.length; t--; i++) {
                        if (value[i]['name']) {
                            arr.push(new Tag(value[i].name, value[i].attr, value[i].child));
                        }
                        else {
                            arr.push(value[i]);
                        }
                    }
                    return arr;
                case "index":
                    return undefined;
                case "id":
                    return undefined;
                default:
                    return value;
            }
        });
        return new Tag(tag.name, tag.attr, tag.child);
    },
        this.toJSON = function (params) {
            var jsonText = JSON.stringify(params, function (key, value) {
                switch (key) {
                    case "parent":
                        return undefined;
                    case "index":
                        return undefined;
                    case "id":
                        return undefined;
                    default:
                        return value;
                }
            });
            return jsonText;
        },
        this.tagOfMethod = tagOfMethod,
        this.setRule = function (rule) {
            Tag_Rule = rule;
        },
        this.getRule = function () {
            return Tag_Rule;
        };
}
