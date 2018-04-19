import './DigestSearchContainer.css';

import { Card, Collapse, Input, List } from 'antd';
import React from 'react';
import Highlighter from 'react-highlight-words';
import { connect } from 'react-redux';

import DigestObject from 'components/DigestModule/DigestObject';
import { ReduxState } from 'reducers';
// import { dispatch } from 'reducers/store';
import { Digest } from 'utils/api';
import util from 'utils/util';

class DigestWithHighlight extends Digest {
  public highlight: React.ReactNode = null;
}

class State {
  public currentPage: number = 1;
  public pageSize: number = 6;
  public search: string = '';
}
class Props {
  public digests: Digest[] = [];
}
class ReduxProps {}
class DigestSearchContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public findDigestsAfterSearch() {
    const { digests } = this.props;
    const { search } = this.state;

    const matchedDigests: DigestWithHighlight[] = [];

    digests.forEach((d: DigestWithHighlight) => {
      const highlightsByCategory: React.ReactNode[] = [];

      const tagResult = d.tags.filter((t) => t.includes(search));
      if (tagResult.length) {
        highlightsByCategory.push(
          <div className="highlightCategoryDiv tag" key="tag">
            <span className="highlightCategoryLabelSpan tag">Tag: </span>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={tagResult.join(' , ')}
            />
          </div>
        );
      }

      const titleResult = d.title.includes(search);
      if (titleResult) {
        highlightsByCategory.push(
          <div className="highlightCategoryDiv title" key="title">
            <span className="highlightCategoryLabelSpan title">Title: </span>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={d.title}
            />
          </div>
        );
      }

      const contentResultRange = [
        d.content.indexOf(search),
        d.content.lastIndexOf(search),
      ];

      if (contentResultRange[0] !== -1) {
        highlightsByCategory.push(
          <div className="highlightCategoryDiv content" key="content">
            <span className="highlightCategoryLabelSpan content">
              Content:{' '}
            </span>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={
                '...' +
                d.content.slice(
                  Math.max(0, contentResultRange[0] - 12),
                  Math.min(
                    d.content.length,
                    contentResultRange[1] + search.length + 12
                  )
                ) +
                '...'
              }
            />
          </div>
        );
      }

      if (highlightsByCategory.length) {
        d.highlight = (
          <Card bordered={false} className="highlightDiv">
            {highlightsByCategory}
          </Card>
        );
        matchedDigests.push(d);
      }
    });

    return matchedDigests;
  }

  public render() {
    const { currentPage, pageSize, search } = this.state;

    const searchBar = (
      <div className="DigestSearchBarContainer">
        <span>Search</span>
        <Input.Search
          className="DigestSearchDiv"
          placeholder="Search title, tags, content"
          onSearch={(value: string) => {
            this.setState({ search: value, currentPage: 1 });
          }}
          enterButton={true}
        />
      </div>
    );

    const digestsAfterSearch = this.findDigestsAfterSearch();
    const shouldShowDigests = util.findCurrentPageItems(
      digestsAfterSearch,
      pageSize,
      currentPage
    );

    return (
      <Collapse className="DigestSearchContainer" activeKey={['search']}>
        <Collapse.Panel header={searchBar} key="search">
          {!search ? (
            'Search title, tags, content'
          ) : (
            <List
              dataSource={shouldShowDigests}
              renderItem={(digest: DigestWithHighlight) => (
                <DigestObject digest={digest} highlight={digest.highlight} />
              )}
              pagination={{
                pageSize,
                current: currentPage,
                total: digestsAfterSearch.length,
                showTotal: (total: number) => `Total ${total} digests`,
                onChange: (newPage: number) =>
                  this.setState({ currentPage: newPage }),
              }}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(DigestSearchContainer as any);