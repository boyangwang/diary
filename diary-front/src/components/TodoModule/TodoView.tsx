import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { ErrResponse, GetTodosResponse, Todo } from 'utils/api';
import util from 'utils/util';

import TodoCheckedListContainer from 'components/TodoModule/TodoCheckedListContainer';
import TodoFormContainer from 'components/TodoModule/TodoFormContainer';
import TodoObject from 'components/TodoModule/TodoObject';
import TodoUncheckedListContainer from 'components/TodoModule/TodoUncheckedListContainer';

import './TodoView.css';

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
        <TodoUncheckedListContainer todos={uncheckedTodos} />
        <TodoCheckedListContainer todos={checkedTodos} />
      </div>
    );
  }

  public render() {
    const { todos } = this.props;

    return (
      <div className="TodoView">
        <h2>TodoView</h2>
        {todos.length === 0 ? 'Empty' : this.renderContent()}
        <TodoFormContainer />
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
