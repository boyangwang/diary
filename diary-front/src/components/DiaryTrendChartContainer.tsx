import React from "react";
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Legend, } from "recharts";

const chartColorPanel = [
  '#007FFF', '#F3D024', '#4CB5FF', '#BC64E5', '#04C9A8',
  '#F75CA9', '#00CFCF', '#F85948',
];
const chartFillColorPanel = [
  'rgba(0, 127, 255, 0.1)', 'rgba(239, 202, 26, 0.2)',
  'rgba(76, 188, 255, 0.35)',
  'rgba(188, 100, 229, 0.35)', 'rgba(4, 201, 168, 0.4)',
  'rgba(247, 92, 196, 0.4)', 'rgba(0, 207, 207, 0.3)',
  'rgba(248, 89, 72, 0.3)',
];

class DiaryTrendChartContainer extends React.Component {
  render() {
    let data: any[] = [
      { date: '2018-03-01', Gym: 1, Dev: 10, Foo: 1, bar1: 12, bar2: 8 },
      { date: '2018-03-02', Gym: 0, Dev: 9,  Foo: 3, bar1: 12, bar2: 8 },
      { date: '2018-03-03', Gym: 1, Dev: 8,  Foo: 5, bar1: 12, bar2: 8 },
      { date: '2018-03-04', Gym: 2, Dev: 7,  Foo: 7, bar1: 12, bar2: 8 },
      { date: '2018-03-05', Gym: 3, Dev: 6,  Foo: 9, bar1: 12, bar2: 8 },
      { date: '2018-03-06', Gym: 4, Dev: 5,  Foo: 11, bar1: 12, bar2: 8 },
      { date: '2018-03-07', Gym: 5, Dev: 4,  Foo: 13, bar1: 12, bar2: 8 },
      { date: '2018-03-01', Gym: 1, Dev: 10, Foo: 1, bar1: 12, bar2: 8 },
      { date: '2018-03-02', Gym: 0, Dev: 9,  Foo: 3, bar1: 12, bar2: 8 },
      { date: '2018-03-03', Gym: 1, Dev: 8,  Foo: 5, bar1: 12, bar2: 8 },
      { date: '2018-03-04', Gym: 2, Dev: 7,  Foo: 7, bar1: 12, bar2: 8 },
      { date: '2018-03-05', Gym: 3, Dev: 6,  Foo: 9, bar1: 12, bar2: 8 },
      { date: '2018-03-06', Gym: 4, Dev: 5,  Foo: 11, bar1: 12, bar2: 8 },
      { date: '2018-03-07', Gym: 5, Dev: 4,  Foo: 13, bar1: 12, bar2: 8 },
    ];
    data = data.map(d => {
      d.sum = Object.keys(d).reduce((prev, cur) => {
        if (cur !== 'date')
          return prev + d[cur];
        else
          return prev;
      }, 0);
      return d;
    });
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" padding={{left: 30, right: 30}} />
          <YAxis />
          <Legend />
          <CartesianGrid strokeDasharray="3 3" />
          <Area type="linear" dataKey="Gym" stackId="3" stroke={chartColorPanel[0]} fill={chartFillColorPanel[0]} dot={true} />
          <Area type="linear" dataKey="Dev" stackId="3" stroke={chartColorPanel[1]} fill={chartFillColorPanel[1]} dot={true} />
          <Area type="linear" dataKey="Foo" stackId="3" stroke={chartColorPanel[2]} fill={chartFillColorPanel[2]} dot={true} />
          <Area className="bar1" type="linear" dataKey="bar1" stackId="1" stroke="#006600" fill="transparent" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.8} />
          <Area className="bar2" type="linear" dataKey="bar2" stackId="2" stroke="#990000" fill="transparent" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
export default DiaryTrendChartContainer;