import './TodoObject.css';

import { Avatar, Button, Checkbox, List, message, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, { DeleteTodoResponse, ErrResponse, Todo } from 'utils/api';
import AddTodoFormContainer from './AddTodoFormContainer';

class Props {
  public todo: Todo;
  public onCheckChange?: (e: any) => void;
}
class ReduxProps {
  public user: User | null;
}
class State {
  public editVisible: boolean = false;
}
class TodoObject extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public deleteTodo() {
    const { todo, user } = this.props;
    if (!user) {
      return;
    }
    api.deleteTodo({ data: { owner: user.username, todo } }).then(
      (data: DeleteTodoResponse & ErrResponse) => {
        if (data.err) {
          message.warn('' + data.err);
        } else if (data.data.todo) {
          dispatch({
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

  public render() {
    const { todo, onCheckChange } = this.props;
    return (
      <List.Item
        className="TodoObject"
        actions={[
          <Button
            className="editButton"
            key="edit"
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
            key="delete"
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
          <Checkbox
            key="check"
            defaultChecked={todo.check}
            onChange={onCheckChange}
          />,
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

export default connect((state: ReduxState) => {
  return {
    user: state.user,
  };
})(TodoObject);
