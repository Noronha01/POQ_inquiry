const sheet_id = '1pNOb0Bbsz410BD_7jUf-G0tH15AB6momF7_RsyevqmA';
const sheet_name = encodeURIComponent("inquiry_data");
const sheet_url = `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;

fetch(sheet_url)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

  function handleResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    // Assuming "Qual é a tua idade" corresponds to "Age" in English
    const ageDistribution = getDataDistribution(sheetObjects, "Qual é a tua idade");
  
    // Prepare data for Chart.js and sort by age categories
    const labels = Object.keys(ageDistribution).sort(compareAgeLabels);
    const data = labels.map(label => ageDistribution[label]);
  
    // Create chart
    const ageCtx = document.getElementById('ageChart').getContext('2d');
    createBarChart(ageCtx, labels, data, 'Age Distribution');
  }
  
  function compareAgeLabels(a, b) {
    const ageRanges = ["< 18", "18 - 30", "30 - 40", "40 - 50", "50 - 60", "> 60"]; // Define your preferred order
    return ageRanges.indexOf(a) - ageRanges.indexOf(b);
  }

function csvToObjects(csv) {
  const csvRows = csv.split("\n");
  const propertyNames = csvSplit(csvRows[0]);
  let objects = [];
  for (let i = 1, max = csvRows.length; i < max; i++) {
    let thisObject = {};
    let row = csvSplit(csvRows[i]);
    for (let j = 0, max = row.length; j < max; j++) {
      thisObject[propertyNames[j]] = row[j];
    }
    objects.push(thisObject);
  }
  return objects;
}

function csvSplit(row) {
  return row.split(",").map((val) => val.substring(1, val.length - 1));
}

function getDataDistribution(data, key) {
  const distribution = {};
  data.forEach(item => {
    const value = item[key];
    if (value) {
      distribution[value] = (distribution[value] || 0) + 1;
    }
  });
  return distribution;
}

function createBarChart(ctx, labels, data, label) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        color: 'white',
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'white' // Text color for y-axis labels
          }
        },
        x: {
          ticks: {
            color: 'white' // Text color for x-axis labels
          }
        },
      }
    }
  });
}
