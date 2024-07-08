// src/utils/dataUtils.js
import { fieldCodes } from './constants';

export async function fetchData(selectedXAxis) {
  const appID = kintone.app.getId();
  const query = `${selectedXAxis} != ""`;
  let allRecords = [];
  let offset = 0;
  const limit = 500;

  try {
    while (true) {
      const resp = await kintone.api(
        kintone.api.url('/k/v1/records', true),
        'GET',
        { app: appID, query: `${query} limit ${limit} offset ${offset}` }
      );
      allRecords = allRecords.concat(resp.records);
      offset += limit;
      if (resp.records.length < limit) {
        break;
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

  return allRecords;
}

export function processData(records, xAxis) {
  return records.reduce((acc, record) => {
    const key = record[xAxis].value;
    if (!acc[key]) {
      acc[key] = {
        sum: 0
      };
      fieldCodes.chartValues.forEach(value => {
        acc[key][value] = 0;
      });
    }
    fieldCodes.chartValues.forEach(value => {
      if (record[value] && record[value].value) {
        acc[key][value] += parseFloat(record[value].value);
        acc[key].sum += parseFloat(record[value].value);
      }
    });
    return acc;
  }, {});
}

export function getPaginatedData(data, page, recordsPerPage) {
  const keys = Object.keys(data);
  const start = (page - 1) * recordsPerPage;
  const end = start + recordsPerPage;
  const paginatedKeys = keys.slice(start, end);

  return paginatedKeys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, {});
}

export function sortData(data, sortOrder, selectedValues) {
  const sortedKeys = Object.keys(data).sort((a, b) => {
    const sumA = selectedValues.reduce((sum, value) => sum + data[a][value], 0);
    const sumB = selectedValues.reduce((sum, value) => sum + data[b][value], 0);
    if (sortOrder === 'asc') {
      return sumA - sumB;
    } else {
      return sumB - sumA;
    }
  });

  return sortedKeys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
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
