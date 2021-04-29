# tagOfMethod
#### 目前仅支持生成HTML，如果需要其它语言请自行定义规则
### Tag对象生成
``` TypeScript
new Tag(name: string | number = '', attr = {}, child = []);
```
### 实例化Tag对象
``` TypeScript
let TAG=new TagUtil();
```
### Tag工具类方法
``` TypeScript
parseJSON(params: string):Tag//将json字符串转Tag对象
toJSON(params: Tag):string//将Tag对象转json字符串
setRule(params: object)//设置当前工具类的生成规则
getRule():object//获取当前工具类的生成规则
```
### Tag生成规则
默认规则为
```
{
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
    }
```
可通工具类的setRule方法设置
其中@代表当前级别，*代表任意，可通过修改**TAG_SELECT_root**和**TAG_SELECT_all**常量进行自定义

## demo
``` typescript
let TAG = new TagUtil();
let project = new Tag('html', { 'lang': 'zh' }, [
        new Tag('head', {}, [
            new Tag('title', {}, ['Demo']),
            new Tag('meta', { 'charset': 'UTF-8' }),
            new Tag('meta', { 'http-equiv': 'X-UA-Compatible', 'content': 'IE=edge' }),
            new Tag('meta', { 'name': 'viewport', 'content': 'width=device-width, initial-scale=1.0' }),
        ]),
        new Tag('body', {}, [
            new Tag('h1', { id: 'hello' }, ['hello world!']),
            new Tag('css', {}, [
                new Tag('css/#hello', { 'font-size': '32px', 'color': 'red', }, []),
            ]),
        ]),
    ]);
let html=TAG.tagOfMethod(project);
document.open();
document.write(html);
console.log();
