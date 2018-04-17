# Front

## components

app - view - container - object

when not react component, use tag. button/div etc

## className

same as component class name, e.g. DiaryApp

## import sequence

- external css
- my css
---
- polyfill
---
- external non-component
- external component
---
- my non-component
- my component

## component boilerplate

We all hate this, but...

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { Collapse, List, Input } from 'antd';

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
})(SomeComponent as any);
```
