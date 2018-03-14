import React from 'react';
import { List, Icon } from 'antd';

class TodoObject extends React.Component {
  render() {
    const { todo } = this.props;
    return (
      <List.Item>
        <div className="TodoObject">
          <div className="_id">{todo._id}</div>
          <div className="title">{todo.title}</div>
          <div className="date">{todo.date}</div>
          <div className="priority">{todo.priority}</div>
          <div className="content">{todo.content}</div>
          <div className="check">
            {todo.check ? <Icon type="check-circle-o" /> :
              <Icon type="minus-circle-o" />}
          </div>
        </div>
      </List.Item>
    );
  }
}

export default TodoObject;
