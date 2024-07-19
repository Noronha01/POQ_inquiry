const sheet_id = '1pNOb0Bbsz410BD_7jUf-G0tH15AB6momF7_RsyevqmA';
const sheet_name = encodeURIComponent("inquiry_data");
//const sheet_url = `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;
const sheet_url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTEaMNC3S5dm1RmKyfvuKk7PDbal5ByZqUkMgC6_3xPYu2E-dkWAbQltdVpznHDjat5AbS4TyOBs3wp/pub?gid=0&single=true&output=csv`;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch data from Google Sheets CSV
    const csvData = await fetchSheetData(sheet_url);
    
    // Parse CSV data into objects
    const sheetObjects = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    // Display total submissions
    displayTotalSubmissions(sheetObjects);

    // Find latest submission time
    const latestSubmission = findLatestSubmission(sheetObjects);
    if (latestSubmission) {
      const { hoursAgo, minutesAgo } = calculateTimeAgo(latestSubmission);
      displayLatestSubmissionTime(hoursAgo, minutesAgo);
    } else {
      displayLatestSubmissionTime('Unknown', 'Unknown'); // If no submissions found
    }

    // Display age distribution chart
    displayAgeDistributionChart(sheetObjects);
    displayExperienceDistributionChart(sheetObjects);
    displayWeeklyGamesDistributionChart(sheetObjects);
    displayClassesDistributionChart(sheetObjects);
    displayLevelDistributionChart(sheetObjects);
  } catch (error) {
    console.error('Error initializing page:', error);
  }
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
  const submissionDate = new Date(latestSubmission);
  submissionDate.setHours(submissionDate.getHours() + 1); // Adjust for the time zone difference
  return submissionDate;
}

function calculateTimeAgo(date) {
  const currentDateTime = new Date();
  const timeDifference = currentDateTime.getTime() - date.getTime();
  const minutesDifference = Math.round(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const remainingMinutes = minutesDifference % 60;
  return { hoursAgo: hoursDifference, minutesAgo: remainingMinutes };
}

function displayLatestSubmissionTime(hoursAgo, minutesAgo) {
  const latestSubmissionDiv = document.getElementById('latestSubmission');
  if (hoursAgo < 1) {
    latestSubmissionDiv.textContent = `${minutesAgo} minutes ago`;
  } else {
    latestSubmissionDiv.textContent = `${hoursAgo} hours and ${minutesAgo} minutes ago`;
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
  const ageRanges = ["18 - 30", "30 - 40", "40 - 50", "50 - 60", "> 60"];
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
  const ageRanges = ["< 6 meses", "6 meses - 1 ano", "1 - 2 anos", "2 - 5 anos", "> 5 anos"];
  return ageRanges.indexOf(a) - ageRanges.indexOf(b);
}

function displayWeeklyGamesDistributionChart(data) {
  // Get the distribution of weekly games
  const weeklyGamesDistribution = getDataDistribution(data, "Quantas vezes por semana jogas Padel");

  // Transform the distribution by mapping "Não jogo todas as semanas" to "Irregular"
  const transformedDistribution = Object.entries(weeklyGamesDistribution).map(([key, value]) => {
    return [key === "Não jogo todas as semanas" ? "Irregular" : key, value];
  });

  // Sort the transformed distribution based on predefined labels
  const sortedDistribution = transformedDistribution.sort((a, b) => compareWeeklyGamesLabels(a[0], b[0]));
  const labels = sortedDistribution.map(entry => entry[0]);
  const dataValues = sortedDistribution.map(entry => entry[1]);

  // Create the chart
  const weeklyGamesCtx = document.getElementById('weeklyGamesChart').getContext('2d');
  createBarChart(weeklyGamesCtx, labels, dataValues, 'Weekly Games Distribution');
}

function compareWeeklyGamesLabels(a, b) {
  const weekly = ["Irregular", "1 vez", "2 vezes", "3/4 vezes", "5+ vezes"];
  return weekly.indexOf(a) - weekly.indexOf(b);
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

function displayLevelDistributionChart(data) {
  const levelDistribution = getDataDistribution(data, "Qual é o teu nível agora?");
  const labels = Object.keys(levelDistribution).sort(compareLevelLabels);
  const dataValues = labels.map(label => levelDistribution[label]);

  const levelCtx = document.getElementById('levelChart').getContext('2d');
  createBarChart(levelCtx, labels, dataValues, 'Level Distribution');
}

function compareLevelLabels(a, b) {
  const levels = ["Iniciante", "F5/M5", "F4/M4", "F3/M3", "F2/M2", "F1/M1", "Não sei"];
  return levels.indexOf(a) - levels.indexOf(b);
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
            color: 'white' // Set text color for y-axis ticks
          }
        },
        x: {
          ticks: {
            color: 'white' // Set text color for x-axis ticks
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
    }
  });
}

function displayClassesDistributionChart(data) {
  const classesDistribution = getDataDistribution(data, "Tens aulas de Padel?");
  const labels = ["Yes", "No"];
  const dataValues = [classesDistribution["Sim"] || 0, classesDistribution["Não"] || 0];
  console.log(data);
  console.log('Classes Distribution:', classesDistribution);
  console.log('Data Values:', dataValues);

  const classesCtx = document.getElementById('classesChart').getContext('2d');
  createPieChart(classesCtx, labels, dataValues, 'Classes');
}

function createPieChart(ctx, labels, data, datasetLabel) {
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
        data: data,
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(192, 75, 75, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(192, 75, 75, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: 'white' // Text color for legend labels
          }
        }
      }
    }
  });
}
