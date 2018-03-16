import './TodoObject.css';

import React from 'react';
import { connect } from 'react-redux';
import { message, Avatar, Button, List, Checkbox, Modal } from 'antd';

import api from 'utils/api';
import AddTodoFormContainer from './AddTodoFormContainer';

class TodoObject extends React.Component {
  state = { editVisible: false };

  deleteTodo() {
    const { todo, user } = this.props;
    api.deleteTodo({ data: { owner: user.username, todo } }).then(
      (data) => {
        if (data.err) {
          message.warn('' + data.err);
        } else if (data.data.todo) {
          this.props.dispatch({
            type: 'DELETE_TODO',
            payload: { todo: data.data.todo },
          });
        }
      },
      (err) => {
        message.warn('' + err);
      }
    );
  }

  render() {
    const { todo, onCheckChange } = this.props;
    return (
      <List.Item
        className="TodoObject"
        actions={[
          <Button
            className="editButton"
            icon="edit"
            size="large"
            onClick={() =>
              this.setState({
                editVisible: true,
              })
            }
          />,
          <Button
            className="deleteButton"
            icon="delete"
            type="danger"
            size="large"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm delete?',
                okText: 'Delete',
                cancelText: 'Cancel',
                onOk: this.deleteTodo.bind(this),
              });
            }}
          />,
          <Checkbox defaultChecked={todo.check} onChange={onCheckChange} />,
        ]}
      >
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
        <Modal
          visible={this.state.editVisible}
          onCancel={() =>
            this.setState({
              editVisible: false,
            })
          }
          footer={null}
          closable={false}
        >
          <AddTodoFormContainer
            todo={todo}
            buttonText={'Edit todo'}
            onSubmit={() =>
              this.setState({
                editVisible: false,
              })
            }
          />
        </Modal>
      </List.Item>
    );
  }
}

export default connect((state) => {
  return {
    user: state.user,
  };
})(TodoObject);
