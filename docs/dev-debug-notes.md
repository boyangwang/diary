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