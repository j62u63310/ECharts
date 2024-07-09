import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { prepareBoxplotData } from '../utils/dataUtils'; // 引入 prepareBoxplotData

const Chart = ({ chartType, data, selectedValues, xAxis }) => {
  const chartRef = useRef(null);

  const getOption = () => {
    const xAxisData = Object.keys(data);
    let series;
    let option;

    switch (chartType) {
      case 'pie':
        series = [{
          name: selectedValues[0],
          type: 'pie',
          radius: '50%',
          data: xAxisData.map(item => ({ name: item, value: data[item][selectedValues[0]] })),
          label: { formatter: '{b}: {c}', position: 'outside' },
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }];
        break;
      case 'scatter':
      case 'effectScatter':
        series = selectedValues.map(value => ({
          name: value,
          type: chartType,
          data: xAxisData.map(item => [item, data[item][value]]),
          symbolSize: chartType === 'effectScatter' ? 20 : 10,
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke' }
        }));
        break;
      case 'heatmap':
        series = [{
          name: selectedValues[0],
          type: 'heatmap',
          data: xAxisData.map((item, idx) => [idx, 0, data[item][selectedValues[0]]]),
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
          name: '數據',
          type: 'funnel',
          data: xAxisData.map(item => ({ name: item, value: data[item][selectedValues[0]] })),
          label: { show: true, position: 'inside', formatter: '{b}: {c}' },
          labelLine: { show: false },
          emphasis: { label: { fontSize: 20 } }
        }];
        break;
      case 'treemap':
        series = [{
          name: selectedValues[0],
          type: 'treemap',
          data: xAxisData.map(item => ({
            name: item,
            value: data[item][selectedValues[0]],
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
        const boxplotData = selectedValues.map(value => (
          prepareBoxplotData(xAxisData.map(item => [data[item][value]]))
        ));
        series = boxplotData.map((item, idx) => ({
          name: selectedValues[idx],
          type: 'boxplot',
          data: item.boxData
        }));
        break;
      case 'gauge':
        series = [{
          name: selectedValues[0],
          type: 'gauge',
          detail: { formatter: '{value}' },
          data: [{ value: data[xAxisData[0]][selectedValues[0]], name: xAxisData[0] }]
        }];
        break;
      case 'radar':
        const radarIndicator = xAxisData.map(item => ({
          name: item,
          max: Math.max(...selectedValues.map(value => data[item][value])) * 1.2
        }));

        series = selectedValues.map(value => ({
          name: value,
          type: 'radar',
          data: [{
            value: xAxisData.map(item => data[item][value]),
            name: value
          }]
        }));

        option = {
          title: {
            text: '庫存資料',
            link: 'https://ken-demo.cybozu.com/k/2004/?view=8252317'
          },
          tooltip: { trigger: 'item' },
          legend: { data: selectedValues },
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
          series: series
        };
        break;
      case 'stackedBar':
        series = selectedValues.map(value => ({
          name: value,
          type: 'bar',
          stack: '總量',
          data: xAxisData.map(item => data[item][value])
        }));
        break;
      default:
        series = selectedValues.map(value => ({
          name: value,
          type: chartType,
          data: xAxisData.map(item => data[item][value]),
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
          data: selectedValues,
          selected: Object.fromEntries(selectedValues.map(value => [value, true]))
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
          bottom: 100 // 調整底部空間大小
        },
        xAxis: chartType === 'pie'   || chartType == 'funnel' || chartType == 'treemap' || chartType == 'gauge'  ? null : {
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
        yAxis: chartType === 'pie'  || chartType == 'funnel' || chartType == 'treemap' || chartType == 'gauge'  ? null : { type: 'value' },
        series: series
      };
    }

    return option;
  };

  return (
    <ReactECharts
      ref={chartRef}
      option={getOption()}
      notMerge={true}
      style={{ width: '100%', height: 'calc(100vh - 200px)' }}
    />
  );
};

export default Chart;
