import React from 'react';
import { connect } from 'react-redux';
import { Card, List, Icon } from 'antd';

import api from 'utils/api';
import AddTodoFormContainer from 'components/AddTodoFormContainer';
import TodoObject from 'components/TodoObject';

class TodoView extends React.Component {
  getTodos() {
    const { dispatch, user } = this.props;
    api.getTodos({ owner: user.username }).then(
      (data) => {
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

  componentWillMount() {
    this.getTodos();
  }

  onCheckChange(todo) {
    const { user } = this.props;
    return (e) => {
      todo.check = e.target.checked;
      api.postTodo({ data: { owner: user.username, todo } });
    };
  }

  renderContent() {
    const { todos } = this.props;

    return (
      <div className="TodosContainer">
        {todos.length === 0 ? (
          'Empty'
        ) : (
          <List
            dataSource={todos}
            renderItem={(todo) => (
              <TodoObject
                todo={todo}
                onCheckChange={this.onCheckChange(todo)}
              />
            )}
          />
        )}
      </div>
    );
  }

  render() {
    const { todos } = this.props;

    return (
      <div className="TodoView">
        <Card title="TodoView">
          {!todos ? <Icon type="loading" /> : this.renderContent()}
        </Card>
        <AddTodoFormContainer />
      </div>
    );
  }
}
export default connect((state) => {
  return {
    todos: state.todos,
    user: state.user,
  };
})(TodoView);
