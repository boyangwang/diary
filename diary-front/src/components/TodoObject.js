import api from 'utils/api';
import React from 'react';
import { Avatar, List, Icon, Checkbox } from 'antd';

class TodoObject extends React.Component {
  render() {
    const { todo, onCheckChange } = this.props;
    return (
      <List.Item
        className="TodoObject"
        actions={[
          <Checkbox
            defaultChecked={todo.check}
            onChange={onCheckChange}
          />
        ]}>
        <List.Item.Meta
          avatar={<Avatar className="priority">{todo.priority}</Avatar>}
          title={
            <div>
              <h4 className="title">{todo.title}</h4>
              <div className="date">{todo.date}</div>
            </div>
          }
          description={<div className="_id">{todo._id}</div>}
        />
        <div className="content">{todo.content}</div>
      </List.Item>
    );
  }
}

export default TodoObject;
