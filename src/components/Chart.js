import React, { useEffect, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { prepareBoxplotData } from '../utils/dataUtils';

const Chart = ({ chartType, data }) => {
  const chartRef = useRef(null);

  const processValue = (value) => (value === undefined || value === null || value === 'N/A') ? 0 : value;

  const getOption = useMemo(() => {
    const xAxisData = Object.keys(data);

    const legends = new Set();
    xAxisData.forEach(key => {
      Object.keys(data[key]).forEach(subKey => {
        if (subKey !== 'sum') legends.add(subKey);
      });
    });

    let series;
    let option;

    switch (chartType) {
      case 'pie':
        series = [{
          name: '合計',
          type: 'pie',
          radius: '50%',
          data: xAxisData.map(item => ({ name: item, value: processValue(data[item]?.sum) })),
          label: { formatter: '{b}: {c}', position: 'outside' },
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }];
        break;
      case 'scatter':
      case 'effectScatter':
        series = Array.from(legends).map(legend => ({
          name: legend,
          type: chartType,
          data: xAxisData.map(item => [item, processValue(data[item]?.[legend])]),
          symbolSize: chartType === 'effectScatter' ? 20 : 10,
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke' }
        }));
        break;
      case 'heatmap':
        series = [{
          name: '熱圖',
          type: 'heatmap',
          data: xAxisData.map((item, idx) => [idx, 0, processValue(data[item]?.sum)]),
          label: {
            show: true,
            formatter: function(params) {
              return `${xAxisData[params.data[0]]}: ${params.data[2]}`;
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }];
        break;
      case 'funnel':
        series = [{
          name: '漏斗圖',
          type: 'funnel',
          data: xAxisData.map(item => ({ name: item, value: processValue(data[item]?.sum) })),
          label: { show: true, position: 'inside', formatter: '{b}: {c}' },
          labelLine: { show: false },
          emphasis: { label: { fontSize: 20 } }
        }];
        break;
      case 'treemap':
        series = [{
          name: '樹狀圖',
          type: 'treemap',
          data: xAxisData.map(item => ({
            name: item,
            value: processValue(data[item]?.sum),
            label: {
              show: true,
              formatter: '{b}: {c}' // 設置標籤顯示格式，{b} 是名字，{c} 是值
            }
          })),
          leafDepth: 1,
          label: {
            show: true,
            formatter: '{b}: {c}', // 設置標籤顯示格式
            position: 'inside', // 標籤位置設置在內部
            textStyle: {
              fontSize: 14, // 設置字體大小
              color: '#000' // 設置字體顏色
            }
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          }
        }];
        break;
      case 'boxplot':
        const boxplotData = xAxisData.map(item =>
          Array.from(legends).map(legend => processValue(data[item]?.[legend]))
        );

        const preparedBoxplotData = prepareBoxplotData(boxplotData).boxData;

        series = [{
          name: '盒鬚圖',
          type: 'boxplot',
          data: preparedBoxplotData
        }];
        break;
      case 'stackedBar':
        series = Array.from(legends).map(legend => ({
          name: legend,
          type: 'bar',
          stack: '總量',
          data: xAxisData.map(key => {
            const processedValue = processValue(data[key]?.[legend]);
            return processedValue;
          }),
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }]
          }
        }));
        break;
      case 'radar':
        const radarIndicator = Array.from(legends).map(legend => ({
          name: legend,
          max: Math.max(...xAxisData.map(item => processValue(data[item]?.[legend]))) * 1.2
        }));

        option = {
          title: {
            text: '庫存資料',
            link: 'https://ken-demo.cybozu.com/k/2004/?view=8252317'
          },
          tooltip: { trigger: 'item' },
          legend: {
            data: xAxisData,
            selected: Object.fromEntries(xAxisData.map(value => [value, true])),
            bottom: 0,
            type: 'scroll',
            orient: 'horizontal'
          },
          toolbox: {
            show: true,
            feature: {
              dataView: {
                title: '數據視圖',
                show: true,
                readOnly: false,
                iconStyle: {
                  borderColor: '#1f77b4',
                },
                lang: ['數據視圖', '關閉', '刷新'],
              },
              saveAsImage: { title: '保存為圖片', show: true }
            }
          },
          radar: { indicator: radarIndicator },
          series: [{
            name: '雷達圖',
            type: 'radar',
            data: xAxisData.map(item => ({
              value: Array.from(legends).map(legend => processValue(data[item]?.[legend])),
              name: item
            }))
          }]
        };
        break;
      default:
        series = Array.from(legends).map(legend => ({
          name: legend,
          type: chartType,
          data: xAxisData.map(key => processValue(data[key]?.[legend])),
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }]
          }
        }));
        break;
    }

    if (chartType !== 'radar') {
      option = {
        title: {
          text: '庫存資料',
          link: 'https://ken-demo.cybozu.com/k/2004/?view=8252317'
        },
        tooltip: { trigger: chartType === 'pie' ? 'item' : 'axis' },
        legend: {
          data: Array.from(legends),
          selected: Object.fromEntries(Array.from(legends).map(value => [value, true])),
          bottom: 0,
          type: 'scroll',
          orient: 'horizontal'
        },
        toolbox: {
          show: true,
          feature: {
            dataView: {
              title: '數據視圖',
              show: true,
              readOnly: false,
              iconStyle: {
                borderColor: '#1f77b4',
              },
              lang: ['數據視圖', '關閉', '刷新'],
            },
            saveAsImage: { title: '保存為圖片', show: true }
          }
        },
        calculable: true,
        grid: {
          left: 50,
          right: 50,
          bottom: 150
        },
        xAxis: chartType === 'pie' || chartType === 'funnel' || chartType === 'treemap' || chartType === 'gauge' ? null : {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: function (value) {
              if (value.length > 10) {
                return value.slice(0, 10) + '...'; // 超過10個字元顯示省略號
              }
              return value;
            }
          }
        },
        yAxis: chartType === 'pie' || chartType === 'funnel' || chartType === 'treemap' || chartType === 'gauge' ? null : { type: 'value' },
        series: series
      };
    }

    return option;
  }, [chartType, data]);

  return (
    <ReactECharts
      ref={chartRef}
      option={getOption}
      notMerge={true}
      style={{ width: '100%', height: 'calc(100vh - 200px)' }}
    />
  );
};

export default Chart;
