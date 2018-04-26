import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Todo } from 'utils/api';

import TodoObject from 'components/TodoModule/TodoObject';

class Props {
  public todos: Todo[];
}
class ReduxProps {}
class State {}
class TodoCheckedListContainer extends React.Component<
  Props & ReduxProps,
  State
> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    const { todos } = this.props;

    return (
      <Collapse>
        <Collapse.Panel header="Checked todos - sorted by: date" key="checked">
          <List
            locale={{ emptyText: 'Empty' }}
            dataSource={todos}
            renderItem={(todo: Todo) => <TodoObject todo={todo} />}
          />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoCheckedListContainer);
