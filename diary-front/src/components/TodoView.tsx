import './TodoView.css';

import {
  Card,
  Collapse,
  Icon,
  List,
  // message
} from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import AddTodoFormContainer from 'components/AddTodoFormContainer';
import TodoObject from 'components/TodoObject';
import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  ErrResponse,
  GetTodosResponse,
  // PostTodoResponse,
  Todo,
} from 'utils/api';
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
      <div className="TodoView">
        <Card title="TodoView">
          {!todos ? (
            <Icon type="loading" />
          ) : todos.length === 0 ? (
            'Empty'
          ) : (
            this.renderContent()
          )}
        </Card>
        <AddTodoFormContainer />
      </div>
    );
  }
}
export default connect((state: ReduxState) => {
  return {
    todos: state.todos,
    user: state.user,
  };
})(TodoView);
