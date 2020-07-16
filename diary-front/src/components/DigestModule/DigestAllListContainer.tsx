import React from 'react';
import { connect } from 'umi';

import { Card, Checkbox, Collapse, Input, List } from 'antd';

import { ReduxState } from 'reducers';
import { Digest } from 'utils/api';
import util from 'utils/util';

import DigestObject from '@/pages/Lanting/DigestObject';

import './DigestAllListContainer.css';

class State {
  public currentPage: number = 1;
  public pageSize: number = 6;
  public tickedTags: string[] = [];
}
class Props {
  public digests: Digest[] = [];
}
class ReduxProps {}
class DigestAllContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = Object.assign({}, new State(), {
      tickedTags: this.getAllTags(),
    });
  }

  public getDigestsAfterFilter() {
    const { digests } = this.props;
    const { tickedTags } = this.state;

    return digests.filter(
      (d) =>
        d.tags.length === 0 || d.tags.some((tag) => tickedTags.includes(tag))
    );
  }

  public findShouldShowDigests(digests: Digest[]) {
    const { currentPage, pageSize } = this.state;

    const sortedByStickyThenModifiedThenCreated = util.sortDigests(digests);

    const currentPageDigests = util.findCurrentPageItems(
      sortedByStickyThenModifiedThenCreated,
      pageSize,
      currentPage
    );

    return currentPageDigests;
  }

  public getAllTags() {
    return [
      ...new Set([].concat(...(this.props.digests.map((d) => d.tags) as any))),
    ].sort();
  }

  public render() {
    const { digests } = this.props;
    const { currentPage, pageSize } = this.state;

    const allTags = this.getAllTags();
    const digestsAfterFilter = this.getDigestsAfterFilter();
    const shouldShowDigests = this.findShouldShowDigests(digestsAfterFilter);

    const header = (
      <div className="DigestAllFilterContainer">
        <span className="title">All</span>
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox.Group
            className="DigestFilterContainer"
            options={allTags}
            defaultValue={allTags}
            onChange={(values) => {
              this.setState({ tickedTags: values.map((t) => t + '') });
            }}
          />
        </div>
      </div>
    );

    return (
      <Collapse className="DigestAllContainer">
        <Collapse.Panel
          header={header}
          key="all"
          showArrow={false}
          forceRender={true}
        >
          <List
            dataSource={shouldShowDigests}
            renderItem={(digest: Digest) => <DigestObject digest={digest} />}
            pagination={{
              pageSize,
              current: currentPage,
              total: digestsAfterFilter.length,
              showTotal: (total: number) => `Total ${total} digests`,
              onChange: (newPage: number) =>
                this.setState({ currentPage: newPage }),
            }}
          />
        </Collapse.Panel>
      </Collapse>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(DigestAllContainer);
