import React from 'react';

import DigestEditorFormContainer from 'components/DigestModule/DigestEditorFormContainer';

class Props {}
class State {}
class DigestView extends React.Component<Props, State> {
  public render() {
    return (
      <div className="DigestView">
        <DigestEditorFormContainer />
      </div>
    );
  }
}
export default DigestView;
