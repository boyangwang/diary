import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { TodoWithHighlight } from 'components/TodoModule/TodoSearchListContainer';
import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Todo } from 'utils/api';
import util from 'utils/util';

import TodoObject from 'components/TodoModule/TodoObject';

class Props {
  public todos: Todo[];
  public headerText?: string = '';
  public hasCollapsePanel?: boolean = true;
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
  public static defaultProps = new Props();

  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    const { todos, headerText, hasCollapsePanel } = this.props;
    const { currentPage, pageSize } = this.state;

    const currentPageTodos = util.findCurrentPageItems(
      todos,
      pageSize,
      currentPage
    );

    let content = (
      <List
        locale={{ emptyText: 'Empty' }}
        dataSource={currentPageTodos}
        renderItem={(todo: TodoWithHighlight) => (
          <TodoObject todo={todo} highlight={todo.highlight} />
        )}
        pagination={{
          pageSize,
          current: currentPage,
          total: todos.length,
          showTotal: (total: number) => `Total ${total} todos`,
          onChange: (newPage: number) =>
            this.setState({ currentPage: newPage }),
        }}
      />
    );

    if (hasCollapsePanel) {
      content = (
        <Collapse>
          <Collapse.Panel header={headerText} key="todos">
            {content}
          </Collapse.Panel>
        </Collapse>
      );
    }

    return content;
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoCheckedListContainer);
