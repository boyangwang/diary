import util from 'utils/util';
import React from 'react';
import { Card, List, Icon } from 'antd';

class TodoView extends React.Component {
  renderContent() {
    const { todos } = this.props;

    return (
      <div className="TodoView">
        {todos.length === 0 ? "Empty" :
          <List
            dataSource={todos}
            renderItem={todo => (
              <List.Item>
                <div className="TodoTitleDiv">{todo.title}</div>
                <div className="TodoContentDiv">{todo.content}</div>
                <div className="TodoDateDiv">{todo.date}</div>
                <div className="TodoPriorityDiv">{todo.priority}</div>
                <div className="TodoCheckDiv">{todo.check}</div>
              </List.Item>
            )}
          />}
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
export default TodoView;
