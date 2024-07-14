const appID = 2004;

function formatDate(dateString) {
  if(dateString === "N/A") return dateString;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}/${month}/${day}`;
}

export async function fetchData(selectedXAxis) {
  const query = `${selectedXAxis} != ""`;
  let allRecords = [];
  let offset = 0;
  const limit = 500;

  const getRecord = {
    app: appID,
    query: `${query} limit ${limit} offset ${offset}`
  }

  try {
    while (true) {
      const resp = await kintone.api(kintone.api.url('/k/v1/records', true),'GET', getRecord);
      
      allRecords = allRecords.concat(resp.records);
      offset += limit;
      if (resp.records.length < limit) {
        break;
      }
    }
  } catch (err) {
    console.error(`fetchData: ${err}`);
    throw err;
  }

  return allRecords;
}

export function processData(records, selectedXAxis, selectedMidAxis, selectedSubAxis, selectChartValues) {
  return records.reduce((accumulator, record) => {
    let xAxis = record[selectedXAxis].value == "" ? "N/A" : record[selectedXAxis].value;
    let midAxis = record[selectedMidAxis].value == "" ? "N/A" : record[selectedMidAxis].value;
    let subAxis = record[selectedSubAxis]?.value || '-';
    const chartValue = parseInt(record[selectChartValues].value, 10);

    xAxis   = selectedXAxis   == "更新時間" || selectedXAxis   == "建立時間" ? formatDate(xAxis) : xAxis;
    midAxis = selectedMidAxis == "更新時間" || selectedMidAxis == "建立時間" ? formatDate(midAxis) : midAxis;
    subAxis = selectedSubAxis == "更新時間" || selectedSubAxis == "建立時間" ? formatDate(subAxis) : subAxis;

    if (subAxis === '-') {
      if (!accumulator[xAxis]) {
        accumulator[xAxis] = {
          "sum" : 0
        };
      }
      if (!accumulator[xAxis][midAxis]) {
        accumulator[xAxis][midAxis] = 0;
      }
      accumulator[xAxis][midAxis] += chartValue;

      accumulator[xAxis].sum += chartValue;
    }else{
      const key = `${xAxis} , ${midAxis}`;
      if (!accumulator[key]) {
        accumulator[key] = {
          sum: 0
        };
        if (subAxis !== '-') {
          if (!accumulator[key][subAxis]) {
            accumulator[key][subAxis] = 0;
          }
          accumulator[key][subAxis] += chartValue;
        }
        accumulator[key].sum += chartValue;
      }
    }

    return accumulator;
  }, {});
}

export function getPaginatedData(data, page, recordsPerPage) {
  const keys = Object.keys(data);
  const start = (page - 1) * recordsPerPage;
  const end = start + recordsPerPage;
  const paginatedKeys = keys.slice(start, end);

  return paginatedKeys.reduce((accumulator, key) => {
    accumulator[key] = data[key];
    return accumulator;
  }, {});
}

export function sortData(data, sortOrder) {
  const sortedKeys = Object.keys(data).sort((a, b) => {
    const sumA = data[a].sum;
    const sumB = data[b].sum;

    if (sortOrder === 'asc') {
      return sumA - sumB;
    } else {
      return sumB - sumA;
    }
  });

  return sortedKeys.reduce((accumulator, key) => {
    accumulator[key] = data[key];
    return accumulator;
  }, {});
}


export function prepareBoxplotData(data) {
  const boxData = [];
  for (let i = 0; i < data.length; i++) {
    const sortedArray = data[i].sort((a, b) => a - b);
    const q1 = sortedArray[Math.floor(sortedArray.length * 0.25)];
    const median = sortedArray[Math.floor(sortedArray.length * 0.5)];
    const q3 = sortedArray[Math.floor(sortedArray.length * 0.75)];
    const min = sortedArray[0];
    const max = sortedArray[sortedArray.length - 1];
    boxData.push([min, q1, median, q3, max]);
  }
  return { boxData };
}