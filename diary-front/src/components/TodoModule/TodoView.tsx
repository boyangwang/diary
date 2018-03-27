import './TodoView.css';

import { Collapse, List } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import TodoFormContainer from 'components/TodoModule/TodoFormContainer';
import TodoObject from 'components/TodoModule/TodoObject';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, GetTodosResponse, Todo } from 'utils/api';
import util from 'utils/util';

class ReduxProps {
  public todos: Todo[];
  public user: User | null;
}
class TodoView extends React.Component<ReduxProps> {
  public getTodos() {
    const { user } = this.props;
    if (!user) {
      return;
    }
    api.getTodos({ owner: user.username }).then(
      (data: GetTodosResponse & ErrResponse) => {
        dispatch({
          type: 'TODOS',
          payload: {
            todos: data.data,
          },
        });
      },
      (err) => {
        this.setState({ err });
      }
    );
  }

  public componentWillMount() {
    this.getTodos();
  }

  public renderContent() {
    const { todos } = this.props;

    const checkedTodos = todos
      .filter((t) => t.check)
      .sort()
      .reverse();
    const uncheckedTodos = todos.filter((t) => !t.check).sort((a, b) => {
      return (
        util.compareDate(a.dueDate, b.dueDate) * 10 +
        util.compare(a.priority, b.priority) * -1
      );
    });

    return (
      <div className="TodosContainer">
        <Collapse>
          <Collapse.Panel
            header="Unchecked todos - sorted by: due date -> priority"
            key="unchecked"
          >
            <List
              locale={{ emptyText: 'Empty' }}
              dataSource={uncheckedTodos}
              renderItem={(todo: Todo) => <TodoObject todo={todo} />}
            />
          </Collapse.Panel>
          <Collapse.Panel
            header="Checked todos - sorted by: date"
            key="checked"
          >
            <List
              locale={{ emptyText: 'Empty' }}
              dataSource={checkedTodos}
              renderItem={(todo: Todo) => <TodoObject todo={todo} />}
            />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  public render() {
    const { todos } = this.props;

    return (
      <Collapse bordered={false} defaultActiveKey={['1']} className="cardlike">
        <Collapse.Panel header={<h2>TodoView</h2>} className="TodoView" key="1">
          {todos.length === 0 ? 'Empty' : this.renderContent()}
          <TodoFormContainer />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    todos: state.todos,
    user: state.user,
  };
})(TodoView);
