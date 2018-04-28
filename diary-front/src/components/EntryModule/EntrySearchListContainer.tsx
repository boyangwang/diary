import React from 'react';
import { connect } from 'react-redux';

import { Card, Collapse, Input, List } from 'antd';
import Highlighter from 'react-highlight-words';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Entry } from 'utils/api';
import util from 'utils/util';

import EntryWeekContainer from 'components/EntryModule/EntryWeekContainer';

import './EntrySearchListContainer.css';

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

  public findEntriesAfterSearch() {
    const { dateRange, entriesDateMap } = this.props;
    const { search } = this.state;

    const matchedDays = dateRange.filter((day) => {
      const entries = entriesDateMap[day] || [];
      const isContainsSearch = entries.some((e) => {
        return !!(
          (e.title && e.title.includes(search)) ||
          (e.content && e.content.includes(search))
        );
      });
      return isContainsSearch;
    });

    return matchedDays;
  }

  public render() {
    const { search } = this.state;

    const searchBar = (
      <div className="SearchBarContainer">
        <span>Search</span>
        <Input.Search
          className="SearchDiv"
          placeholder="Search title, content and find matching days"
          onSearch={(value: string) => {
            this.setState({ search: value });
          }}
          enterButton={true}
        />
      </div>
    );

    const daysAfterSearch = this.findEntriesAfterSearch();

    return (
      <Collapse className="SearchContainer" activeKey={['search']}>
        <Collapse.Panel
          header={searchBar}
          key="search"
          showArrow={false}
          forceRender={true}
        >
          {!search ? (
            'Search title, content and find matching days'
          ) : (
            <div>
              <span>{daysAfterSearch.join(' | ')}</span>
              <EntryWeekContainer
                hasCollapsePanel={false}
                dateRange={daysAfterSearch}
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
