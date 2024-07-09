import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import Dropdown from './components/Dropdown';
import Button from './components/Button';
import { fetchData, processData, sortData, getPaginatedData } from './utils/dataUtils';
import { fieldCodes, chartTypeTitles } from './utils/constants';
import './styles/styles.css';

const App = () => {
  const [chartType, setChartType] = useState('bar');
  const [selectedValues, setSelectedValues] = useState(['庫存數量']);
  const [selectedXAxis, setSelectedXAxis] = useState('商品名稱');
  const [data, setData] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [recordsPerPage, setRecordsPerPage] = useState(40);

  useEffect(() => {
    fetchData(selectedXAxis)
      .then(records => {
        const processedData = processData(records, selectedXAxis);
        const sortedData = sortData(processedData, sortOrder, selectedValues);
        const paginatedData = getPaginatedData(sortedData, 1, recordsPerPage);
        setData(paginatedData);
      })
      .catch(error => console.error(error));
  }, [selectedXAxis, selectedValues, chartType, sortOrder, recordsPerPage]);

  const handleValueChange = (newValues) => {
    setSelectedValues(newValues);
  };

  return (
    <div className="App">
      <div id="controls">
        <Dropdown
          label="大分類"
          options={fieldCodes.xAxisOptions.map(option => ({
            value: option,
            label: option
          }))}
          selected={selectedXAxis}
          onChange={setSelectedXAxis}
        />
        <Dropdown
          label="顯示圖表"
          options={Object.keys(chartTypeTitles).map(key => ({
            value: key,
            label: chartTypeTitles[key]
          }))}
          selected={chartType}
          onChange={setChartType}
        />
        <Dropdown
          label="排序"
          options={[{ value: 'asc', label: '升序' }, { value: 'desc', label: '降序' }]}
          selected={sortOrder}
          onChange={setSortOrder}
        />
        <Dropdown
          label="顯示前幾筆"
          options={[10, 20, 30, 40, 50].map(option => ({
            value: option,
            label: option.toString()
          }))}
          selected={recordsPerPage}
          onChange={value => setRecordsPerPage(parseInt(value))}
        />
      </div>
      <Chart
        chartType={chartType}
        data={data}
        selectedValues={selectedValues}
        xAxis={selectedXAxis}
      />
    </div>
  );
};

export default App;
