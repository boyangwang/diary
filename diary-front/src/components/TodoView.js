import util from 'utils/util';
import api from 'utils/api';
import AddTodoFormContainer from 'components/AddTodoFormContainer';
import TodoObject from 'components/TodoObject';
import React from 'react';
import { connect } from 'react-redux';
import { Card, List, Icon } from 'antd';

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
      api.postTodo({data: {owner: user.username, todo}});
    }
  }

  renderContent() {
    const { todos } = this.props;

    return (
      <div className="TodoView">
        {todos.length === 0 ? "Empty" :
          <List
            dataSource={todos}
            renderItem={todo => (
              <TodoObject todo={todo} onCheckChange={this.onCheckChange(todo)} />
            )}
          />}
        <AddTodoFormContainer />
      </div>
    );
  }

  render() {
    const { todos } = this.props;

    return (
      <Card title="TodoView">
        {!todos ? <Icon type="loading" /> : this.renderContent()}
      </Card>
    );
  }
}
export default connect((state) => {
  return {
    todos: state.todos,
    user: state.user,
  };
})(TodoView);
