import classnames from 'classnames';
import omit from 'omit.js';
import Animate from 'rc-animate';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Icon } from '@ant-design/compatible';

import { FrequencyMap } from 'utils/api';

import CheckableTag from './CheckableTag';
export { CheckableTagProps } from './CheckableTag';

import 'antd/lib/tag/style/css';

export interface TagProps {
  prefixCls?: string;
  className?: string;
  color?: string;
  /** 标签是否可以关闭 */
  closable?: boolean;
  /** 关闭时的回调 */
  onClose?: (e: any) => void;
  /** 动画关闭后的回调 */
  afterClose?: () => void;
  style?: React.CSSProperties;
}

export interface TagState {
  closing: boolean;
  closed: boolean;
}

export default class Tag extends React.Component<TagProps, TagState> {
  public static CheckableTag = CheckableTag;
  public static defaultProps = {
    prefixCls: 'ant-tag',
    closable: false,
  };

  constructor(props: TagProps) {
    super(props);

    this.state = {
      closing: false,
      closed: false,
    };
  }

  public close = (e: React.MouseEvent<HTMLElement>) => {
    const onClose = this.props.onClose;
    if (onClose) {
      onClose(e);
    }
    if (e.defaultPrevented) {
      return;
    }
    const dom = ReactDOM.findDOMNode(this) as HTMLElement;
    dom.style.width = `${dom.getBoundingClientRect().width}px`;
    // It's Magic Code, don't know why
    dom.style.width = `${dom.getBoundingClientRect().width}px`;
    this.setState({
      closing: true,
    });
  };

  public animationEnd = (_: string, existed: boolean) => {
    if (!existed && !this.state.closed) {
      this.setState({
        closed: true,
        closing: false,
      });

      const afterClose = this.props.afterClose;
      if (afterClose) {
        afterClose();
      }
    }
  };

  public isPresetColor(color?: string): boolean {
    if (!color) {
      return false;
    }
    return /^(pink|red|yellow|orange|cyan|green|blue|purple|geekblue|magenta|volcano|gold|lime)(-inverse)?$/.test(
      color
    );
  }

  public render() {
    const { prefixCls, closable, color, className, children, style, ...otherProps } = this.props;
    const closeIcon = closable ? <Icon type="cross" onClick={this.close} /> : '';
    const isPresetColor = this.isPresetColor(color);
    const classString = classnames(
      prefixCls,
      {
        [`${prefixCls}-${color}`]: isPresetColor,
        [`${prefixCls}-has-color`]: color && !isPresetColor,
        [`${prefixCls}-close`]: this.state.closing,
      },
      className
    );
    // fix https://fb.me/react-unknown-prop
    const divProps = omit(otherProps, ['onClose', 'afterClose']);
    const tagStyle = {
      backgroundColor: color && !isPresetColor ? color : null,
      ...style,
    };
    const tag = this.state.closed ? null : (
      <div data-show={!this.state.closing} {...divProps} className={classString} style={tagStyle}>
        {children}
        {closeIcon}
      </div>
    );
    return (
      <Animate
        component=""
        showProp="data-show"
        transitionName={`${prefixCls}-zoom`}
        transitionAppear={true}
        onEnd={this.animationEnd}
      >
        {tag}
      </Animate>
    );
  }
}
