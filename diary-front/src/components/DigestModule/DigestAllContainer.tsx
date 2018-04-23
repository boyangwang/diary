import React from 'react';
import { connect } from 'react-redux';

import { Card, Checkbox, Collapse, Input, List } from 'antd';

import { ReduxState } from 'reducers';
import { Digest } from 'utils/api';
import util from 'utils/util';

import DigestObject from 'components/DigestModule/DigestObject';

import './DigestAllContainer.css';

class State {
  public currentPage: number = 1;
  public pageSize: number = 6;
}
class Props {
  public digests: Digest[] = [];
}
class ReduxProps {}
class DigestAllContainer extends React.Component<Props & ReduxProps, State> {
  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public findShouldShowDigests() {
    const { digests } = this.props;
    const { currentPage, pageSize } = this.state;

    const sortedByStickyThenModifiedThenCreated = digests.sort((a, b) => {
      return (
        util.compare(a.tags.includes('sticky'), b.tags.includes('sticky')) *
          -100 +
        util.compare(a.lastModified, b.lastModified) * -10 +
        util.compare(a.createTimestamp, b.createTimestamp) * -1
      );
    });
    const currentPageDigests = util.findCurrentPageItems(
      sortedByStickyThenModifiedThenCreated,
      pageSize,
      currentPage
    );

    return currentPageDigests;
  }

  public render() {
    const { digests } = this.props;
    const { currentPage, pageSize } = this.state;

    return (
      <Collapse>
        <Collapse.Panel header="All" key="all">
          <Checkbox.Group
            options={['a', 'b', 'c']}
            onChange={(values) => {
              console.log('checked = ', values);
            }}
          />
          <List
            dataSource={this.findShouldShowDigests()}
            renderItem={(digest: Digest) => <DigestObject digest={digest} />}
            pagination={{
              pageSize,
              current: currentPage,
              total: digests.length,
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
})(DigestAllContainer as any);
