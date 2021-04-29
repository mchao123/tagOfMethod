(function (win, doc) {
    var TAG = new TagUtil();
    var project = new Tag('html', { 'lang': 'zh' }, [
        new Tag('head', {}, [
            new Tag('title', {}, ['标题']),
            new Tag('meta', { 'charset': 'UTF-8' }),
            new Tag('meta', { 'http-equiv': 'X-UA-Compatible', 'content': 'IE=edge' }),
            new Tag('meta', { 'name': 'viewport', 'content': 'width=device-width, initial-scale=1.0' }),
        ]),
        new Tag('body', {}, [
            new Tag('h1', { id: 'hello' }, ['hello world!']),
            new Tag('css', {}, [
                new Tag('css/#hello', { 'font-size': '32px', 'color': 'red' }, []),
            ]),
        ]),
    ]), Tag_Rule_defult = TAG.getRule(), Tag_Rule_Debug = {
        '@': {
            '#': {
                'tag': {
                    '*': ['<span _uuid="', TAG_RULE_ID, '"><!-- ', TAG_RULE_child, ' --></span>']
                },
                'attr': {
                    '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
                }
            },
            'css': {
                'tag': {
                    '*': ['<style _uuid="', TAG_RULE_ID, '"', TAG_RULE_parent_attr, '> ', TAG_RULE_tag, '{', TAG_RULE_attr, '} </style>']
                },
                'attr': {
                    '*': [TAG_RULE_attr_name, ': ', TAG_RULE_attr_value, ';']
                }
            },
            'tag': {
                'html': ['<', TAG_RULE_tag, TAG_RULE_attr, '>', TAG_RULE_child, '</', TAG_RULE_tag, '>'],
                'css': ['<span _uuid="', TAG_RULE_ID, '">', TAG_RULE_child, '</span>'],
                'br': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                'hr': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                'link': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                'img': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                'input': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                'meta': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '"/>'],
                '#': ['<span _uuid="', TAG_RULE_ID, '"><!-- ', TAG_RULE_child, ' --></span>'],
                '*': ['<', TAG_RULE_tag, TAG_RULE_attr, ' _uuid="', TAG_RULE_ID, '">', TAG_RULE_child, '</', TAG_RULE_tag, '>']
            },
            'attr': {
                '*': [' ', TAG_RULE_attr_name, '="', TAG_RULE_attr_value, '"']
            }
        }
    };
    var cursor = project;
    TAG.setRule(Tag_Rule_Debug);
    var v_win, v_doc;
    win.addEventListener('load', function () {
        var el = {
            show: doc.querySelector('#show'),
            module: doc.querySelector('#module')
        };
        v_doc = el.show.contentDocument, v_win = el.show.contentWindow;
        updateTag(project);
        var module = [
            {
                name: '文本',
                html: '这是一段文本'
            },
            {
                name: 'DIV',
                tag: TAG.toJSON(new Tag('div', {}, []))
            },
            {
                name: '图片',
                tag: TAG.toJSON(new Tag('img', {
                    src: 'https://tse3-mm.cn.bing.net/th/id/OIP.HNjIcEzCAuS4i7r4cG9aQgHaHa?pid=ImgDet&rs=1'
                }, []))
            },
            {
                name: 'CSS块',
                tag: TAG.toJSON(new Tag('css', {}, [
                    new Tag('css/body', {
                        color: '10px'
                    }, [])
                ]))
            },
            {
                name: 'CSS规则',
                tag: TAG.toJSON(new Tag('css/body', {
                    'font-size': '18px'
                }, []))
            },
        ];
        el.module.appendChild(el_list(module, function (item) {
            var li = doc.createElement('li');
            li.innerText = item.name;
            li.onclick = function () {
                item.html ? cursor.appendChild(item.html) : cursor.appendChild(TAG.parseJSON(item.tag));
                updateTag(cursor);
                edTag(cursor);
            };
            return li;
        }, 'ul'));
    });
    /**
     * 元素被点击
     * @param e
     */
    function v_doc_click(e) {
        var el_arr = e.composedPath();
        // console.time('getarr')
        for (var i = 0, j = el_arr.length; j--; i++) {
            var el = el_arr[i], uuid = void 0, tag = void 0;
            uuid = el.getAttribute ? el.getAttribute('_uuid') : false;
            uuid && (tag = Tag_ID_Cache[uuid]);
            if (tag) {
                edTag(tag);
                break;
            }
        }
        // console.timeEnd('getarr')
    }
    function edTag(tag) {
        cursor = tag;
        var obj = {
            get name() { return tag.name; }, set name(value) { tag.name = value; updateTag(tag); },
            get attr() { return tag.attr; },
            get child() { return tag.child; },
            get this() { return tag; }
        }, el = doc.querySelector('#attr'), frag = doc.createDocumentFragment(), path = doc.querySelector('#path'), path_tag = tag, path_frag = doc.createDocumentFragment();
        while (path_tag) {
            var item = doc.createElement('span');
            item.setAttribute('_uuid', path_tag.id.toString());
            item.className = 'path';
            item.innerText = path_tag.name;
            item.onclick = v_doc_click;
            path_frag.appendChild(item);
            path_tag = path_tag.parent;
        }
        var path_clone = path.cloneNode();
        path_clone.appendChild(path_frag);
        path.parentNode.replaceChild(path_clone, path);
        // Object.defineProperty(obj, "child", { get:function(){return tag.child}, set: function (value) { tag.child=value; } });
        tag.parent && frag.appendChild(el_button('父元素', function (e) {
            tag.parent && edTag(tag.parent);
        }));
        frag.appendChild(el_button('添加属性', function () {
            var attr = prompt('请输入要添加的属性');
            if (attr && !obj.attr[attr]) {
                obj.attr[attr] = '';
                edTag(tag);
            }
            else
                alert('添加失败');
        }));
        frag.appendChild(el_button('删除属性', function () {
            var attr = prompt('请输入要添加的属性');
            if (obj.attr[attr]) {
                delete obj.attr[attr];
                edTag(tag);
                updateAttr(tag, attr);
            }
            else
                alert('属性不存在');
        }));
        frag.appendChild(el_input('标签名：', function (e) {
            var target = e.target;
            obj.name = target.value;
        }, obj.name));
        var _loop_1 = function (k) {
            frag.appendChild(el_input(k, function (e) {
                var target = e.target;
                obj.attr[k] = target.value;
                updateAttr(tag, k);
            }, obj.attr[k]));
        };
        for (var k in obj.attr) {
            _loop_1(k);
        }
        var list = doc.createElement('div');
        list.innerHTML = '子元素';
        list.appendChild(el_list(obj.child, function (item, i) {
            var li = doc.createElement('li');
            if (typeof item == 'string') {
                li.appendChild(el_input('文本：', function (e) {
                    var target = e.target;
                    obj.child[i] = target.value;
                    updateTag(tag);
                }, item));
            }
            else {
                li.style.display = 'flex';
                var label = doc.createElement('span');
                label.style.flex = '1';
                label.innerText = item.name;
                label.onclick = function () {
                    edTag(item);
                };
                li.appendChild(label);
            }
            li.appendChild(el_button('删除', function (e) {
                obj["this"].removeChild(i);
                edTag(tag);
                updateTag(tag);
            }));
            return li;
        }));
        frag.appendChild(list);
        //将虚拟节点绘制出来
        var el_clone = el.cloneNode();
        el_clone.appendChild(frag);
        el.parentNode.replaceChild(el_clone, el);
    }
    function updateTag(tag) {
        var el = v_doc.querySelector("[_uuid=\"" + tag.id + "\"]");
        if (el) {
            el.outerHTML = TAG.tagOfMethod(tag);
        }
        else {
            v_doc.open();
            v_doc.write(TAG.tagOfMethod(project));
            v_win.addEventListener('click', v_doc_click);
        }
    }
    function updateAttr(tag, attr) {
        if (tag.name.split(TAG_CHAR_split)[0] == 'css' && tag.name != 'css') {
            updateTag(tag);
            return;
        }
        console.log(TAG.tagOfMethod(tag));
        var el = v_doc.querySelector("[_uuid=\"" + tag.id + "\"]");
        if (el) {
            var value = tag.attr[attr];
            if (value) {
                el.setAttribute(attr, value);
                // console.log(tag,attr);
            }
            else {
                el.removeAttribute(attr);
            }
        }
        else {
            v_doc.open();
            v_doc.write(TAG.tagOfMethod(project));
            v_win.addEventListener('click', v_doc_click);
        }
    }
    function el_input(label, callback, value) {
        var el = doc.createElement('div'), el_1 = doc.createElement('label'), el_2 = doc.createElement('input');
        el_1.innerText = label;
        callback && (el_2.onkeyup = callback);
        value && (el_2.value = value);
        el.appendChild(el_1);
        el.appendChild(el_2);
        return el;
    }
    function el_button(label, callback) {
        var el = doc.createElement('button');
        el.innerText = label;
        callback && (el.onclick = callback);
        return el;
    }
    function el_list(arr, callback, tagName) {
        if (tagName === void 0) { tagName = 'ol'; }
        var el = doc.createElement(tagName);
        for (var i = 0, j = arr.length; j--; i++) {
            var eln = callback ? callback(arr[i], i) : (function (str) {
                var el = doc.createElement('li');
                el.innerText = str;
                return el;
            })(arr[i]);
            eln && el.appendChild(eln);
        }
        return el;
    }
})(window, document);
// <div id="attr" >
//     <div>
//     <label>标签名：</label><input type="text" placeholder="标签名"></div >
//         <button>添加属性 < /button><button>删除属性</button >
//         <div><label>子元素 < /label><ol><li>h1<button>删除</button > </li><li>h2<button>删除</button > </li></ol >
//         <button>添加元素 < /button>
//         < /div > 
//         < /div>
