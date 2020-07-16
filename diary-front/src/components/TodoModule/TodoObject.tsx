import React from 'react';
import { connect } from 'umi';

import { Alert, Button, Checkbox, List, message, Modal } from 'antd';

import { ReduxState, User } from 'reducers';
import { dispatch } from 'reducers/store';
import api, {
  DeleteTodoResponse,
  ErrResponse,
  GetTodosResponse,
  PostTodoResponse,
  Todo,
} from 'utils/api';

import TodoFormContainer from './TodoFormContainer';

import './TodoObject.css';

class Props {
  public todo: Todo;
  public highlight?: React.ReactNode;
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

  public syncItem(): void {
    const { todo, user } = this.props;

    api.getTodo({ owner: user!.username, _id: todo._id! }).then(
      (data: GetTodosResponse & ErrResponse) => {
        if (data.data && data.data[0]) {
          dispatch({
            type: 'UPDATE_TODO',
            payload: { todo: data.data[0] },
          });
        }
      },
      (err) => {}
    );
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
      (err) => {}
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
        (err) => {}
      );
    };
  }

  public render() {
    const { todo, highlight } = this.props;
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
            className="syncButton"
            key="sync"
            icon="reload"
            size="large"
            onClick={() => this.syncItem()}
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
              {highlight || null}
              <h3 className="title">{todo.title}</h3>
              <Alert
                className="priority"
                message={todo.priority}
                type={todo.priority <= 12 ? 'success' : 'error'}
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
