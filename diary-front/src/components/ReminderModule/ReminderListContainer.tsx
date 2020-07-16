import React from 'react';
import { connect } from 'react-redux';

import { Collapse, List } from 'antd';

import { ReduxState } from 'reducers';
import { dispatch } from 'reducers/store';
import { Reminder } from 'utils/api';
import util from 'utils/util';

import ReminderObject from 'components/ReminderModule/ReminderObject';

class Props {
  public reminders: Reminder[];
  public headerText?: string = '';
  public hasCollapsePanel?: boolean = true;
}
class ReduxProps {}
class State {
  public currentPage: number = 1;
  public pageSize: number = 12;
}
class TodoCheckedListContainer extends React.Component<
  Props & ReduxProps,
  State
> {
  public static defaultProps = new Props();

  public constructor(props: Props & ReduxProps) {
    super(props);
    this.state = new State();
  }

  public render() {
    const { reminders, headerText, hasCollapsePanel } = this.props;
    const { currentPage, pageSize } = this.state;

    const currentPageReminders = util.findCurrentPageItems(
      reminders,
      pageSize,
      currentPage
    );

    let content = (
      <List
        locale={{ emptyText: 'Empty' }}
        dataSource={currentPageReminders}
        renderItem={(reminder: Reminder) => (
          <ReminderObject reminder={reminder} />
        )}
        pagination={{
          pageSize,
          current: currentPage,
          total: reminders.length,
          showTotal: (total: number) => `Total ${total} reminders`,
          onChange: (newPage: number) =>
            this.setState({ currentPage: newPage }),
        }}
      />
    );

    if (hasCollapsePanel) {
      content = (
        <Collapse>
          <Collapse.Panel
            header={headerText}
            key="reminders"
            forceRender={true}
          >
            {content}
          </Collapse.Panel>
        </Collapse>
      );
    }

    return content;
  }
}
export default connect<ReduxProps, {}, Props>((state: ReduxState) => {
  return {};
})(TodoCheckedListContainer);
