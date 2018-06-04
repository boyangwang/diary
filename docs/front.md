# Front

## components

app - view - container - object

when not react component, use tag. button/div etc

## className

same as component class name, e.g. DiaryApp

## import sequence

- polyfill
---
- external non-component
---
- external component
---
- my non-component
---
- my component
---
- external css
- my css

When one `import` statement imports multiple kinds, e.g. `import Component, { nonComponent } from 'foobar'`, take the highest precedence

## component boilerplate

We all hate this, but...

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api from 'utils/api';
import util from 'utils/util';

class State {
  public someState: string = 'someState';
}
class Props {
  public someProp: string = 'someProp';
}
class ReduxProps {
  public user: User | null;
  public reduxPropFromState: string;
}
class SomeComponent extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    return (
      <div>SomeComponent</div>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    user: state.user,
    reduxPropFromState: state.reduxPropFromState,
  };
})(SomeComponent);
```

```jsx
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';

class Props {
}
class ReduxProps {

}
class State {

}
class TodoCheckedListContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    return null;
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoCheckedListContainer);
```

## isomorphicUtils sharedUtils 问题

```
Module not found: You attempted to import ../../../isomorphicUtils which falls outside of the project src/ directory. Relative imports outside of src/ are not supported. You can either move it inside src/, or add a symlink to it from project's node_modules/
```

So add a symlink from outer to front/src. This might make it incompatible with Windows. We see how...

整体来说还是有点问题, 先后解决的步骤:
- 不允许src/以外, 是因为CRA只处理src/里面的代码(比如babel), 这很合理, 但我需要eject
- dep问题, isomorphicUtil里面怎么require. 最后直接写路径找了front的moment, 这样后端又可以暂时不加moment
