import React from 'react';
import { connect } from 'react-redux';

import { Card, Collapse, Input, List } from 'antd';
import Highlighter from 'react-highlight-words';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Todo } from 'utils/api';
import util from 'utils/util';

import TodoListContainer from 'components/TodoModule/TodoListContainer';

export class TodoWithHighlight extends Todo {
  public highlight: React.ReactNode = null;
}

class State {
  public search: string = '';
}
class Props {
  public todos: Todo[] = [];
}
class ReduxProps {}
class TodoSearchContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public findTodosAfterSearch() {
    const { todos } = this.props;
    const { search } = this.state;

    const matchedTodos: TodoWithHighlight[] = [];

    todos.forEach((d: Todo) => {
      const highlightsByCategory: React.ReactNode[] = [];

      if (d.title && d.title.includes(search)) {
        highlightsByCategory.push(
          <div className="highlightCategoryDiv highlightedTitle" key="title">
            <span className="highlightCategoryLabelSpan">Title: </span>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={d.title}
            />
          </div>
        );
      }

      if (d.content && d.content.includes(search)) {
        highlightsByCategory.push(
          <div
            className="highlightCategoryDiv highlightedContent"
            key="content"
          >
            <span className="highlightCategoryLabelSpan">Content: </span>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={d.content}
            />
          </div>
        );
      }

      if (highlightsByCategory.length) {
        const newTodo = Object.assign({}, d, {
          highlight: (
            <Card bordered={false} className="highlightDiv">
              {highlightsByCategory}
            </Card>
          ),
        });
        matchedTodos.push(newTodo);
      }
    });

    return matchedTodos;
  }

  public render() {
    const { search } = this.state;

    const searchBar = (
      <div className="SearchBarContainer">
        <span>Search</span>
        <Input.Search
          className="SearchDiv"
          placeholder="Search title, content"
          onSearch={(value: string) => {
            this.setState({ search: value });
          }}
          enterButton={true}
        />
      </div>
    );

    const todosAfterSearch = this.findTodosAfterSearch();

    return (
      <Collapse className="SearchContainer" activeKey={['search']}>
        <Collapse.Panel
          header={searchBar}
          key="search"
          showArrow={false}
          forceRender={true}
        >
          {!search ? (
            'Search title, tags, content'
          ) : (
            <TodoListContainer
              todos={todosAfterSearch}
              headerText=""
              hasCollapsePanel={false}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoSearchContainer);
