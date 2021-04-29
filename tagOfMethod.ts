const//全局常量
    TAG_CODE_ERROR = 0x0,//错误
    TAG_CODE_STATUS = 0x1,//正确
    TAG_CODE_FIND = 0x2,//成功找到资源、路径、方法
    TAG_CODE_NOTFIND = 0x3,//找不到资源、路径、方法


    TAG_CHAR_split = '/',


    TAG_SELECT_root = '@',//根目录选择器
    TAG_SELECT_all = '*',//通配符选择器


    TAG_RULE_tag = 0x1,//标签名
    TAG_RULE_attr = 0x2,//属性
    TAG_RULE_attr_name = 0x1,//属性名
    TAG_RULE_attr_value = 0x2,//属性值
    TAG_RULE_child = 0x3,//子节点
    TAG_RULE_ID = 0x4,//唯一标识
    TAG_RULE_parent_tag = 0x5,//父元素标签名
    TAG_RULE_parent_attr = 0x6;//父元素属性
let//全局变量
    Tag_ID = 0,//缓存的索引
    Tag_ID_Cache = {};//缓存

interface Tag {
    name: string,
    attr: object,
    index?: number,
    parent?: Tag,
    child: Array<string | Tag>,
    id: number,
    [propeName: string]: any
}
interface Rule {
    tag: Array<number | string>,
    attr: Array<number | string>,
}

function Tag(name: string | number = '', attr = {}, child = []) {
    this.name = name;
    this.attr = attr;
    this.child = child;
    this.id = Tag_ID;
    Tag_ID_Cache[Tag_ID++] = this;
    child && ((self) => {
        let len = self.child.length, i = 0;
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
    appendChild: function (tag: any) {
        tag.index = this.child.length;
        tag.parent = this;//为子节点添加父节点索引
        this.child.push(tag);
    },
    /**
     * 插入元素到子节点
     * @param tag 字符串或Tag
     * @param index 插入位置，默认插入到开头值为0
     */
    insertChild: function (tag: any, index = 0) {
        tag.index = index++;
        tag.parent = this;//为子节点添加父节点索引
        index == 0 ? this.child.unshift(tag) : this.child.splice(index - 1, 0, tag);
        let len = this.child.length;
        while (index < len) {
            this.child[index].index = index++;
        }
    },
    /**
     * 删除子节点
     * @param index 要删除的索引
     */
    removeChild: function (index = this.child.length - 1) {
        index == 0 ? this.child.shift() : index == this.child.length - 1 ? this.child.pop() : this.child.splice(index, 1);
        let len = this.child.length;
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
    replaceChild: function (tag: any, index = 0, remove = 1) {
        tag.index = index;
        tag.parent = this;//为子节点添加父节点索引
        this.child.splice(index, remove, tag);
        if (remove != 1) {
            let len = this.child.length;
            while (index < len) {
                this.child[index].index = index++;
            }
        }
    }
}

function TagUtil() {
    let Tag_Rule = {
        '@': {
            '#': {
                'tag': {
                    '*': ['<!-- ', TAG_RULE_child, ' -->'],
                },
                'attr': {
                    '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
                }
            },
            'style': {
                'tag': {
                    '*': [TAG_RULE_tag, '{', TAG_RULE_attr, '}'],
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
                '*': ['<', TAG_RULE_tag, TAG_RULE_attr, '>', TAG_RULE_child, '</', TAG_RULE_tag, '>'],
            },
            'attr': {
                '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
            }
        },
    },
        Tag_Rule_Cache = {};//缓存


    function formatTag(obj: Tag, rule: Rule, parent_rule: Rule): string {
        let i = 0,
            arr = [],
            rule_tag = rule.tag,
            rule_attr = rule.attr,
            obj_attr = obj.attr,
            obj_child = obj.child,
            obj_name = obj.name.split(TAG_CHAR_split);

        while (i < rule_tag.length) {
            switch (rule_tag[i]) {
                case TAG_RULE_tag:
                    arr.push(obj_name[obj_name.length - 1]);
                    break;
                case TAG_RULE_attr:
                    for (let k in obj_attr) {
                        let attr = [];
                        for (let j = rule_attr.length; j--;) {
                            switch (rule_attr[j]) {
                                case TAG_RULE_attr_name:
                                    attr.unshift(k);
                                    break;
                                case TAG_RULE_attr_value:
                                    attr.unshift(obj_attr[k]);
                                    break;
                                default:
                                    attr.unshift(rule_attr[j])
                            }
                        }
                        arr.push(attr.join(''))
                    }

                    break;
                case TAG_RULE_child:
                    let child = [];
                    for (let j = obj_child.length; j--;) {
                        child.unshift(tagOfMethod(obj_child[j]))
                    }
                    arr.push(child.join(''));
                    break;
                case TAG_RULE_ID:
                    arr.push(obj.id)
                    break;
                case TAG_RULE_parent_tag:
                    if (obj.parent) {
                        let obj_name = obj.parent.name.split(TAG_CHAR_split)
                        arr.push(obj_name[obj_name.length - 1]);
                    }
                    break;
                case TAG_RULE_parent_attr:
                    if (obj.parent && parent_rule) {
                        let obj_attr = obj.parent.attr, rule_attr = parent_rule.attr;
                        for (let k in obj_attr) {
                            let attr = [];
                            for (let j = rule_attr.length; j--;) {
                                switch (rule_attr[j]) {
                                    case TAG_RULE_attr_name:
                                        attr.unshift(k);
                                        break;
                                    case TAG_RULE_attr_value:
                                        attr.unshift(obj_attr[k]);
                                        break;
                                    default:
                                        attr.unshift(rule_attr[j])
                                }
                            }
                            arr.push(attr.join(''))
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

    function findRule(tagName: string, rule: any,): Array<number | object> {
        let arr = tagName.split(TAG_CHAR_split), path = rule, flag = TAG_CODE_NOTFIND, obj = { tag: {}, attr: {} };

        for (let t = arr.length, i = 0; t--; i++) {

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
                } else {
                    console.log(`@root下无法找到${tagName}${arr[i]}的规则`);
                    break;
                }
            } else {
                let str = 'tag';
                if (path[str] && path[str][arr[i]]) {
                    obj[str] = path[str][arr[i]];
                }
                else if (path[TAG_SELECT_root] && path[TAG_SELECT_root][str]) {
                    if (path[TAG_SELECT_root][str][arr[i]]) {
                        obj[str] = path[TAG_SELECT_root][str][arr[i]];
                    }
                    else if (path[TAG_SELECT_root][str][TAG_SELECT_all]) {
                        obj[str] = path[TAG_SELECT_root][str][TAG_SELECT_all];
                    } else {
                        console.log(`@root下无法找到${tagName}的tag规则`);
                        break;
                    }
                }
                else if (path[str] && path[str][TAG_SELECT_all]) {
                    obj[str] = path[str][TAG_SELECT_all];
                } else {
                    console.log(`无法找到${tagName}的tag规则`);
                    break;
                }
                //attr规则
                str = 'attr'
                if (path[str] && path[str][arr[i]]) {
                    obj[str] = path[str][arr[i]];
                }
                else if (path[TAG_SELECT_root] && path[TAG_SELECT_root][str]) {
                    if (path[TAG_SELECT_root][str][arr[i]]) {
                        obj[str] = path[TAG_SELECT_root][str][arr[i]];
                    }
                    else if (path[TAG_SELECT_root][str][TAG_SELECT_all]) {
                        obj[str] = path[TAG_SELECT_root][str][TAG_SELECT_all];
                    } else {
                        console.log(`@root下无法找到${tagName}的attr规则`);
                        break;
                    }
                }
                else if (path[str] && path[str][TAG_SELECT_all]) {
                    obj[str] = path[str][TAG_SELECT_all];
                } else {
                    console.log(`无法找到${tagName}的attr规则`);
                    break;
                }
                flag = TAG_CODE_FIND;
            }
        }
        return [flag, obj];
    }

    function tagOfMethod(obj: Tag | string): string {
        if (typeof obj == 'string') return obj
        if (obj instanceof Tag) {

            let tagName = obj.name, tagPName: any, tagPRule: any;
            let tagRule = Tag_Rule_Cache[tagName];
            // console.log(obj.name)
            if (!tagRule) {
                let find = findRule(tagName, Tag_Rule);
                // console.log(find)
                if (find[0] == TAG_CODE_FIND) {
                    tagRule = find[1];
                } else {
                    return `找不到${tagName}`
                }
            }

            if (obj.parent) {
                tagPName = obj.parent.name;
                tagPRule = Tag_Rule_Cache[tagPName];
                // console.log(obj.name)
                if (!tagPRule) {
                    let find = findRule(tagPName, Tag_Rule);
                    // console.log(find)
                    if (find[0] == TAG_CODE_FIND) {
                        tagPRule = find[1];
                    } else {
                        return `找不到${tagPName}`
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



    this.parseJSON = (params: string) => {
        let tag = JSON.parse(params, function (key, value) {
            switch (key) {
                case "child":
                    let arr = [];
                    for (let i = 0, t = value.length; t--; i++) {
                        if (value[i]['name']) {
                            arr.push(new Tag(value[i].name, value[i].attr, value[i].child));
                        } else {
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
        })
        return new Tag(tag.name, tag.attr, tag.child);
    },
        this.toJSON = (params: object): string => {
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
            })
            return jsonText;
        },
        this.tagOfMethod = tagOfMethod,
        this.setRule = (rule: any) => {
            Tag_Rule = rule;
        },
        this.getRule = () => {
            return Tag_Rule;
        };
}
