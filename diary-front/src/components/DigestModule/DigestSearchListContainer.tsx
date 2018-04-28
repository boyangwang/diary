import React from 'react';
import { connect } from 'react-redux';

import { Button, Card, Collapse, Input, List } from 'antd';
import Highlighter from 'react-highlight-words';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Digest } from 'utils/api';
import util from 'utils/util';

import DigestObject from 'components/DigestModule/DigestObject';

import './DigestSearchListContainer.css';

const searchPlaceholder = 'Search title, tags, content';

export class DigestWithHighlight extends Digest {
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

    digests.forEach((d: Digest) => {
      const highlightsByCategory: React.ReactNode[] = [];

      const tagResult = d.tags.filter((t) => t.includes(search));
      if (tagResult.length) {
        highlightsByCategory.push(
          <div className="highlightCategoryDiv highlightedTag" key="tag">
            <span className="highlightCategoryLabelSpan">Tag: </span>
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

      const contentResultRange = [
        d.content.indexOf(search),
        d.content.lastIndexOf(search),
      ];

      if (contentResultRange[0] !== -1) {
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
        const newDigest = Object.assign({}, d, {
          highlight: (
            <Card bordered={false} className="highlightDiv">
              {highlightsByCategory}
            </Card>
          ),
        });
        matchedDigests.push(newDigest);
      }
    });

    return matchedDigests;
  }

  public render() {
    const { currentPage, pageSize, search } = this.state;

    const searchBar = (
      <div className="SearchBarContainer">
        <span>Search</span>
        <Input.Search
          className="SearchDiv"
          placeholder={searchPlaceholder}
          onSearch={(value: string) => {
            this.setState({ search: value, currentPage: 1 });
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

    const digestsAfterSearch = this.findDigestsAfterSearch();
    const digestsAfterSort = util.sortDigests(digestsAfterSearch);
    const shouldShowDigests = util.findCurrentPageItems(
      digestsAfterSort,
      pageSize,
      currentPage
    );

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
})(DigestSearchContainer);
