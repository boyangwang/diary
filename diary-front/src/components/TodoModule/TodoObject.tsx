import './TodoObject.css';

import { Alert, Button, Checkbox, List, message, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  DeleteTodoResponse,
  ErrResponse,
  PostTodoResponse,
  Todo,
} from 'utils/api';
import TodoFormContainer from './TodoFormContainer';

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

  public onCheckChange(todo: Todo) {
    const { user } = this.props;
    if (!user) {
      return () => {};
    }
    return (e: any) => {
      todo.check = e.target.checked;
      api.postTodo({ data: { owner: user.username, todo } }).then(
        (data: PostTodoResponse & ErrResponse) => {
          if (data.err) {
            message.warn('' + data.err);
          } else {
            this.setState(this.state);
          }
        },
        (err) => {
          message.warn('' + err);
        }
      );
    };
  }

  public render() {
    const { todo } = this.props;
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
            checked={todo.check}
            onChange={this.onCheckChange(todo)}
          />,
        ]}
      >
        <List.Item.Meta
          avatar={<div className="dueDate">{todo.dueDate || 'No due'}</div>}
          title={
            <div>
              <h3 className="title">{todo.title}</h3>
              <Alert
                className="priority"
                message={todo.priority}
                type="success"
              />
            </div>
          }
          description={
            <div>
              <div className="date grey">{todo.date}</div>
              <div className="_id grey">{todo._id}</div>
            </div>
          }
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
          <TodoFormContainer
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
