import React from 'react';

class DayContainer extends React.Component {
    componentWillMount() {

    }

    render() {
        return <div>{this.props.date}</div>
    }
}

export default DayContainer;