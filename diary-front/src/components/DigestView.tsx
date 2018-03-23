import React from 'react';

import DigestEditorForm from 'components/DigestEditorForm';

class Props { }
class State { }
class DigestView extends React.Component<Props, State> {
  public render() {
    return (
      <div className="DigestView">
        <DigestEditorForm />
      </div>
    );
  }
}
export default DigestView;
