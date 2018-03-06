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