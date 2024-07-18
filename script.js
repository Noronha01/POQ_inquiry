const sheet_id = '1pNOb0Bbsz410BD_7jUf-G0tH15AB6momF7_RsyevqmA';
const sheet_name = encodeURIComponent("inquiry_data");
const sheet_url = `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch data from Google Sheets CSV
  const csvData = await fetchSheetData(sheet_url);

  // Parse CSV data into objects
  const sheetObjects = csvToObjects(csvData);

  // Display total submissions
  displayTotalSubmissions(sheetObjects);

  // Find latest submission time
  const latestSubmission = findLatestSubmission(sheetObjects);
  if (latestSubmission) {
    const hoursAgo = calculateHoursAgo(latestSubmission);
    displayLatestSubmissionTime(hoursAgo);
  } else {
    displayLatestSubmissionTime('Unknown'); // If no submissions found
  }

  // Display age distribution chart
  displayAgeDistributionChart(sheetObjects);

  displayExperienceDistributionChart(sheetObjects);
});

async function fetchSheetData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.text();
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

function findLatestSubmission(data) {
  if (data.length === 0) return null;

  // Assuming "Submitted at" is in the format "2024/07/17 17:59:25"
  const latestSubmission = data[data.length - 1]['Submitted at'];
  return new Date(latestSubmission);
}

function calculateHoursAgo(date) {
  const currentDateTime = new Date();
  const timeDifference = currentDateTime.getTime() - date.getTime();
  const hoursDifference = Math.round(timeDifference / (1000 * 60 * 60));
  return hoursDifference;
}

function displayLatestSubmissionTime(hoursAgo) {
  const latestSubmissionDiv = document.getElementById('latestSubmission');
  if (hoursAgo < 1) {
    latestSubmissionDiv.textContent = '<1 hour ago';
  } else {
    latestSubmissionDiv.textContent = `${hoursAgo} hours ago`;
  }
}

function displayTotalSubmissions(data) {
  const totalSubmissions = data.length; // Assuming each object represents a submission
  const totalSubmissionsDiv = document.getElementById('totalSubmissions');
  totalSubmissionsDiv.textContent = totalSubmissions;
}

function displayAgeDistributionChart(data) {
  const ageDistribution = getDataDistribution(data, "Qual é a tua idade");
  const labels = Object.keys(ageDistribution).sort(compareAgeLabels);
  const dataValues = labels.map(label => ageDistribution[label]);

  const ageCtx = document.getElementById('ageChart').getContext('2d');
  createBarChart(ageCtx, labels, dataValues, 'Age Distribution');
}

function compareAgeLabels(a, b) {
  const ageRanges = ["18 - 30", "30 - 40", "40 - 50", "50 - 60"];
  return ageRanges.indexOf(a) - ageRanges.indexOf(b);
}

function displayExperienceDistributionChart(data) {
  const experienceDistribution = getDataDistribution(data, "Há quanto tempo jogas padel?");
  const labels = Object.keys(experienceDistribution).sort(compareExperienceLabels);
  const dataValues = labels.map(label => experienceDistribution[label]);

  const experienceCtx = document.getElementById('experienceChart').getContext('2d');
  createBarChart(experienceCtx, labels, dataValues, 'Padel Experience Distribution');
}

function compareExperienceLabels(a, b) {
  const ageRanges = ["< 6 meses", "6 meses - 1 ano", "1 - 2 anos", "2 - 5 anos"];
  return ageRanges.indexOf(a) - ageRanges.indexOf(b);
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

function createBarChart(ctx, labels, data, datasetLabel) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'white'
          }
        },
        x: {
          ticks: {
            color: 'white'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'white' // Text color for legend labels
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20
        }
      },
    }
  });
}
