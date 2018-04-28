import React from 'react';
import { connect } from 'react-redux';

import { Button, Card, Collapse, Input, List } from 'antd';
import Highlighter from 'react-highlight-words';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Entry } from 'utils/api';
import util from 'utils/util';

import EntryWeekContainer from 'components/EntryModule/EntryWeekContainer';

import './EntrySearchListContainer.css';

const searchPlaceholder = 'Search title, content and find matching days';

class State {
  public search: string = '';
}
class Props {
  public dateRange: string[];
}
class ReduxProps {
  public entriesDateMap: {
    [date: string]: Entry[];
  };
}
class EntrySearchContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public getDaysHighlightsMap() {
    const { dateRange, entriesDateMap } = this.props;
    const { search } = this.state;

    const daysHighlightsMap = {};

    dateRange.forEach((day) => {
      const entries = entriesDateMap[day] || [];
      const matches: React.ReactNode[] = [];
      entries.forEach((e) => {
        if (e.title && e.title.includes(search)) {
          matches.push(
            <div className="highlightCategoryDiv highlightedTitle" key="title">
              <span className="highlightCategoryLabelSpan">Title: </span>
              <Highlighter
                highlightClassName="highlight"
                searchWords={[search]}
                autoEscape={true}
                textToHighlight={e.title}
              />
            </div>
          );
        }
        if (e.content && e.content.includes(search)) {
          matches.push(
            <div
              className="highlightCategoryDiv highlightedContent"
              key="content"
            >
              <span className="highlightCategoryLabelSpan">Content: </span>
              <Highlighter
                highlightClassName="highlight"
                searchWords={[search]}
                autoEscape={true}
                textToHighlight={e.content}
              />
            </div>
          );
        }
      });
      if (matches.length !== 0) {
        daysHighlightsMap[day] = (
          <Card bordered={true} className="highlightDiv">
            {matches}
          </Card>
        );
      }
    });

    return daysHighlightsMap;
  }

  public render() {
    const { search } = this.state;

    const searchBar = (
      <div className="SearchBarContainer">
        <span>Search</span>
        <Input.Search
          className="SearchDiv"
          placeholder={searchPlaceholder}
          onSearch={(value: string) => {
            this.setState({ search: value });
          }}
          enterButton={true}
          suffix={
            <Button onClick={() => this.setState({ search: '' })}>
              Clear{' '}
            </Button>
          }
        />
      </div>
    );

    const daysHighlightsMap = this.getDaysHighlightsMap();
    const daysAfterSearch = Object.keys(daysHighlightsMap);

    return (
      <Collapse className="SearchContainer" activeKey={['search']}>
        <Collapse.Panel
          header={searchBar}
          key="search"
          showArrow={false}
          forceRender={true}
        >
          {!search ? (
            searchPlaceholder
          ) : (
            <div>
              <span>{daysAfterSearch.join(' | ')}</span>
              <EntryWeekContainer
                hasCollapsePanel={false}
                dateRange={daysAfterSearch}
                highlights={daysHighlightsMap}
              />
            </div>
          )}
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {
    entriesDateMap: state.entriesDateMap,
  };
})(EntrySearchContainer);
