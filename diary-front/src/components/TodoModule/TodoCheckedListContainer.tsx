import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Todo } from 'utils/api';
import util from 'utils/util';

import TodoObject from 'components/TodoModule/TodoObject';

class Props {
  public todos: Todo[];
}
class ReduxProps {}
class State {
  public currentPage: number = 1;
  public pageSize: number = 12;
}
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
    const { currentPage, pageSize } = this.state;

    const currentPageTodos = util.findCurrentPageItems(
      todos,
      pageSize,
      currentPage
    );

    return (
      <Collapse>
        <Collapse.Panel header="Checked todos - sorted by: date" key="checked">
          <List
            locale={{ emptyText: 'Empty' }}
            dataSource={currentPageTodos}
            renderItem={(todo: Todo) => <TodoObject todo={todo} />}
            pagination={{
              pageSize,
              current: currentPage,
              total: todos.length,
              showTotal: (total: number) => `Total ${total} todos`,
              onChange: (newPage: number) =>
                this.setState({ currentPage: newPage }),
            }}
          />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoCheckedListContainer);
