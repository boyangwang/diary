import * as _ from 'lodash';
import React from 'react';
import util from 'utils/util';

function shallowEqual(a: any, b: any) {
  for (const key in a) {
    if (
      {}.hasOwnProperty.call(a, key) &&
      (!{}.hasOwnProperty.call(b, key) || a[key] !== b[key])
    ) {
      return false;
    }
  }
  for (const key in b) {
    if ({}.hasOwnProperty.call(b, key) && !{}.hasOwnProperty.call(a, key)) {
      return false;
    }
  }
  return true;
}

function pureRender(component: any) {
  component.prototype.shouldComponentUpdate = function shouldComponentUpdate(
    props: any,
    state: any
  ) {
    return !shallowEqual(props, this.props) || !shallowEqual(state, this.state);
  };
}

export interface TooltipPayload {
  name: string;
  value: string | number | Array<string | number>;
  unit?: string;
  color?: string;
  fill?: string;
}
const defaultFormatter = (value: any) =>
  _.isArray(value) &&
  util.isNumOrStrAndNotNaN(value[0]) &&
  util.isNumOrStrAndNotNaN(value[1])
    ? value.join(' ~ ')
    : value;

class Props {
  public separator?: string;
  public formatter: Function;
  public wrapperStyle: any;
  public itemStyle: any;
  public labelStyle: any;
  public labelFormatter: Function;
  public label: any;
  public payload: TooltipPayload[];
  public itemSorter: (a: TooltipPayload, b: TooltipPayload) => 0 | 1 | -1;
}
class PropsDefaults {
  public separator: ' : ';
  public itemStyle: {};
  public labelStyle: {};
}
@pureRender
class DiaryTrendChartTooltipContent extends React.Component<
  Props & PropsDefaults
> {
  public static displayName = 'DiaryTrendChartTooltipContent';
  public static defaultProps = new PropsDefaults();

  public renderContent() {
    const { payload, separator, formatter, itemStyle, itemSorter } = this.props;

    if (payload && payload.length) {
      const listStyle = { padding: 0, margin: 0 };

      const items = payload.sort(itemSorter).map((entry, i) => {
        const finalItemStyle = {
          display: 'block',
          paddingTop: 4,
          paddingBottom: 4,
          color: entry.color || '#000',
          ...itemStyle,
        };
        const hasName = util.isNumOrStrAndNotNaN(entry.name);
        const finalFormatter = formatter || defaultFormatter;

        return (
          <li
            className="recharts-tooltip-item"
            key={`tooltip-item-${i}`}
            style={finalItemStyle}
          >
            {hasName ? (
              <span className="recharts-tooltip-item-name">{entry.name}</span>
            ) : null}
            {hasName ? (
              <span className="recharts-tooltip-item-separator">
                {separator}
              </span>
            ) : null}
            <span className="recharts-tooltip-item-value">
              {finalFormatter
                ? finalFormatter(entry.value, entry.name, entry, i)
                : entry.value}
            </span>
            <span className="recharts-tooltip-item-unit">
              {entry.unit || ''}
            </span>
          </li>
        );
      });

      return (
        <ul className="recharts-tooltip-item-list" style={listStyle}>
          {items}
        </ul>
      );
    }

    return null;
  }

  public render() {
    const { labelStyle, label, labelFormatter, wrapperStyle } = this.props;
    const finalStyle = {
      margin: 0,
      padding: 10,
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      whiteSpace: 'nowrap',
      ...wrapperStyle,
    };
    const finalLabelStyle = {
      margin: 0,
      ...labelStyle,
    };
    const hasLabel = _.isNumber(label) || _.isString(label);
    let finalLabel = hasLabel ? label : '';

    if (hasLabel && labelFormatter) {
      finalLabel = labelFormatter(label);
    }

    return (
      <div className="recharts-default-tooltip" style={finalStyle}>
        <p className="recharts-tooltip-label" style={finalLabelStyle}>
          {finalLabel}
        </p>
        {this.renderContent()}
      </div>
    );
  }
}

export default DiaryTrendChartTooltipContent;
