import './DigestSearchContainer.css';

import { Collapse, Input, List } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import DigestObject from 'components/DigestModule/DigestObject';
import { ReduxState } from 'reducers';
// import { dispatch } from 'reducers/store';
import { Digest } from 'utils/api';
import util from 'utils/util';

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
    // TODO
    return digests;
  }

  public render() {
    const { currentPage, pageSize } = this.state;

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
      <Collapse.Panel
        className="DigestSearchContainer"
        header={searchBar}
        key="search"
        prefixCls="ant-collapse"
      >
        <List
          dataSource={shouldShowDigests}
          renderItem={(digest: Digest) => <DigestObject digest={digest} />}
          pagination={{
            pageSize,
            current: currentPage,
            total: digestsAfterSearch.length,
            showTotal: (total: number) => `Total ${total} digests`,
            onChange: (newPage: number) =>
              this.setState({ currentPage: newPage }),
          }}
        />
      </Collapse.Panel>
    );
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(DigestSearchContainer as any);
