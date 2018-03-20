# dev-debug-notes

## yarn

- First there was a package with 404. Suspect registry path/format issue, causing wrong url (is-stream/download/is-stream-1.1.0.tgz)

- Also server and local need different registry (taobao mirror vs original). So removing yarn.lock fixed both above and this problem

- Then yarn is giving incompatible engines, because node ver too old. Ubuntu ver is also too old, so can't install latest from apt. Used nvm to get diff versions of node

- But, yarn is always using default ver of node (installed from apt). 6.3.1, which is not compatible

- Tried to remove yarn. So that it's installed with npm, not apt. So it should be attached with the npm's node, which is from nvm

- But this caused yarn to not be found (yarn: command not found). Because flightplan is using login shell, so bash_profile, not bash_rc. Yarn's $PATH change only in bash_rc. Added to bash_profile (maybe source entire bash_rc in profile better)

- After all these, yarn is still using default node?? apt purge nodejs is too much risk. Settled with --ignore-engines

## serve static

nginx is still the better solution in terms of generality and perf. symlinking nginx conf to sites-enabled is not hard

On the other hand, multiple sites in one server is messy. It gets worse when https comes in. And need to do proxy pass too - I've implemented all of these, so I could (without too much trouble) replicate this. For now, it seems I'm not doing anything on pg:80

Decide to use nginx route, and get a aliyun free (?) server to deploy

## flightplan

又解决了若干个bug...

- flightplan.js必须在根目录, 因为liftoff没配置好

- .sudo 和 .exec 实现方式和行为都不一样! .sudo 的时候, function叫不了, 只能command. 因为这个结果nvm半天出不来, command not found. 其实本意是叫一下nvm use default, 但是其实不必要

- 因为用了pm2 --interpreter来解决用哪个node的问题. 要不然, 又跑去默认node, 6.x连async都跑不起来

## nginx

配置真是太可怕了

比较简单的方式实现了后端proxy_pass, 还是需要两个port, 暂时写死了. 前端, nginx直接听port 14432, 从外界来的请求打到port, serve文件. 后端, 是nginx听:14432/api, 收到直接转给:14464, 结果转回来

## field name真的有引号

~~很奇怪的bug, 多了一次JSON.stringify (由于isomorphic fetch是改写的API), field看起来是"username", 其实是\"\"~~

搞错啦, 果然是我自己的问题. isomorphic里面设type json是必要的

## mobile chrome就报错, apply of undefined?

一开始看到这个都绝望了, 因为手机没root, adb连接不停断, 看到报错也是一头包, sourcemap不能load...

后来绝望之下搜索, 竟然找到答案! https://github.com/zalmoxisus/redux-devtools-extension/issues/320

https://github.com/zalmoxisus/redux-devtools-extension#12-advanced-store-setup

## chrome security disabled locally

本地开发环境好的, 线上却报错. 结果发现我忘了我本地chrome安全性设置关掉了

线上线下统一真是任重道远, f2etest这次帮我找到了问题 (我抱着试一试的想法用UC web跑了一下)

## pm2不更新后端脚本?

遇到一个问题排查好久才发现, 后端api endpoint定义没更新? server.js是新的, 那看来是pm2 in-memory的问题. 最后重写了flightplan脚本, 上来先stop (以免由于在跑, rm rf不成功?)

反正现在看来是行了, 通过改logging验证了一下

## 阿里郎忽略hosts?

必须VPN除外列表里的才能走正常DNS, 忘了... (或者说不知道DNS也劫持, 但想想这正常, 因为
好多是内网域名. 但是怎么也该是个包含list, 不该是个除外啊)

## test突然不过了??

一开始以为是并发/setup teardown, 时序问题, 改了半天换了testid, 最后好像是afterEach的问题... 因为我加了describe test suite, afterEach编程了在每个suite之后进行?? 放进了describe里面, 好像就好了. 醉了. 也就是说加了describe之后, 我没有多跑几次test.

感觉还是有点不对, 但是目前看问题解决了.

Quoting doc:

> If afterEach is inside a describe block, it only runs after the tests that are inside this describe block.

> If you want to run some cleanup just once, after all of the tests run, use afterAll instead.

## passport不管用?

果然是我根本没implement localStrategy, 之前就觉得不对, 还以为逻辑都在passport.authenticate里面, 其实那个里面给的是callback

## n次因为ObjectId和string _id的问题排查半天

测试不写好, 这事完不了. 快把测试改对吧!

## 在测试里写了一个恐怖的bug

`delete exampleTodo._id`, 会影响之后所有test. 但是因为是parallel, 所以不一定出不出错或者谁出错

## mongodb这二货db, 看呆了

insert/update之后要query, 得等一秒钟... 改了testutil, 之前问题全好了, 醉了. 看官网例子果然有用

## husky hook不跑, 果然是因为版本对不上. 在package.json放hook的位置不一样了

太自信是不好, 人家说了是@next

## tslint.json 仰天长啸啊, 没想到jsRules是单独的, 怪不得改rules不管用!

想不到. 早查查doc, 别怀疑是别人bug就好了 (都没有类似的report)

## 解决了一堆匪夷所思的ts bug之后 (antd的locale被pass到div, redux connect 怎么都不给用dispatch, 嫌props里没有, index.d.ts不被pickup, 好像是不鼓励重名只有后缀不一样的文件名, 最后改成types.d.ts就奏效???) 终于算行了

发布!

## 又遇到还没解决的ts + react + redux 问题

看这里https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11640#issuecomment-350198556

## 非常奇怪, 遇到一个移动端模拟不出来的bug. 原因是如果设了flex: 1 1 和 flex-basis

flex-basis会变成 0%, 此时如果模拟mobile, 显示正常, 如果在mobile chrome上, 就会缩成一个竖条

## 我的人生已经遇到过足够多可怕的bug了, 总结来说, 最艰苦的之一可以算是在服务器端, *nix/OS/binary相关的bug. 这一个是scp: scp竟然是读每一行output的!

由于我.bashrc里面有echo, 导致出来的stdout被scp读了, scp不认, 直接挂断!

我verbose一行一行读, 才看到有一个最可疑的sink!

当然, 之前也有hint, bashrc我有好多行output, 但是一行印出来就断了. 其实是立刻报错退出了
