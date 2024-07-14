import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import Dropdown from './components/Dropdown';
import { fetchData, processData, sortData, getPaginatedData } from './utils/dataUtils';
import { fieldCodes, chartTypeTitles } from './utils/constants';
import './styles/styles.css';

const App = () => {
  const [chartType, setChartType] = useState('bar');
  const [selectedValues, setSelectedValues] = useState(['庫存數量']);
  const [selectedXAxis, setSelectedXAxis] = useState('商品名稱');
  const [selectedMidAxis, setSelectedMidAxis] = useState('倉庫名稱');
  const [selectedSubAxis, setSelectedSubAxis] = useState('-');
  const [selectChartValues, setSelectChartValues] = useState('庫存數量');
  const [data, setData] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [recordsPerPage, setRecordsPerPage] = useState(40);

  useEffect(() => {
    console.log("useEffect執行")
    fetchData(selectedXAxis)
      .then(records => {
        const processedData = processData(records, selectedXAxis, selectedMidAxis, selectedSubAxis, selectChartValues);
        const sortedData = sortData(processedData, sortOrder, selectedValues);
        const paginatedData = getPaginatedData(sortedData, 1, recordsPerPage);
        setData(paginatedData);
      })
      .catch(error => console.error(error));
  }, [selectedXAxis, selectedMidAxis, selectedSubAxis, selectedValues, chartType, sortOrder, recordsPerPage, selectChartValues]);

  const getDisabledOptions = (selectedOptions) => {
    return fieldCodes.xAxisOptions.filter(option => selectedOptions.includes(option));
  };

  const handleXAxisChange = (value) => {
    setSelectedXAxis(value);
    if (selectedMidAxis === value) setSelectedMidAxis('');
    if (selectedSubAxis === value) setSelectedSubAxis('');
  };

  const handleMidAxisChange = (value) => {
    setSelectedMidAxis(value);
    if (selectedSubAxis === value) setSelectedSubAxis('');
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
          onChange={handleXAxisChange}
          disabledOptions={getDisabledOptions([selectedMidAxis, selectedSubAxis])}
        />
        <Dropdown
          label="中分類"
          options={fieldCodes.xAxisOptions.map(option => ({
            value: option,
            label: option
          }))}
          selected={selectedMidAxis}
          onChange={handleMidAxisChange}
          disabledOptions={getDisabledOptions([selectedXAxis, selectedSubAxis])}
        />
        <Dropdown
          label="小分類"
          options={['-', ...fieldCodes.xAxisOptions].map(option => ({
            value: option,
            label: option
          }))}
          selected={selectedSubAxis}
          onChange={setSelectedSubAxis}
          disabledOptions={getDisabledOptions([selectedXAxis, selectedMidAxis])}
        />
        <Dropdown
          label="合計"
          options={fieldCodes.chartValues.map(option => ({
            value: option,
            label: option
          }))}
          selected={selectChartValues}
          onChange={setSelectChartValues}
        />
        <Dropdown
          label="排序"
          options={[{ value: 'asc', label: '升序' }, { value: 'desc', label: '降序' }]}
          selected={sortOrder}
          onChange={setSortOrder}
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
          label="顯示前幾筆"
          options={[10, 20, 30, 40].map(option => ({
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
      />
    </div>
  );
};

export default App;
