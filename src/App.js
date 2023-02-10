import { useState } from 'react';
import './App.css';
import ReactApexChart  from "react-apexcharts";
import mainData from './data.json';


function App(prop) {
  const [jobsChartGranularity,setColumnChartGranularity] = useState('Hours');
  const [distanceChartGranularity,setDistanceChartGranularity] = useState('Hours');
  const [distanceChartFrom,setDistanceChartFrom] = useState();
  const [distanceChartTo,setDistanceChartTo] = useState();
  const pieChartData = {
    successCount:0,
    failedCount:0,
    abortCount:0,
    emergencyCount:0
  };
  let tripMap = new Map();


  //Processing jobs to get time and node traveled data
  let [maxT,minT] = [0,Infinity];
  mainData.JobStats.forEach((job,index)=>{
    if(job.SuccessFlag) {
      pieChartData.successCount++;
    } else {
      pieChartData.failedCount++;
      if(job.AbortFlag) {
        pieChartData.abortCount++;
      } 
      if(job.EmergencyFlag) {
        pieChartData.emergencyCount++;
      }
    }
    maxT = Math.max(maxT,job.TimeStamp);
    minT = Math.min(minT,job.TimeStamp);
    job.TimeStamp2 = new Date(job.TimeStamp*1000);
    if(tripMap.has(job.Start_Node_Name)) {
      let toMap = tripMap.get(job.Start_Node_Name);
      if(toMap.has(job.End_Node_Name)) {
        toMap.set(job.End_Node_Name,toMap.get(job.End_Node_Name)+1);
      } else {
        toMap.set(job.End_Node_Name,1);
      }
    } else {
      tripMap.set(job.Start_Node_Name,new Map().set(job.End_Node_Name,1));
    }
  });
  // console.log(tripMap);
  const [nodeFrom,setNodeFrom] = useState(tripMap.entries().next().value[0]);
  const [nodeTo,setNodeTo] = useState(tripMap.get(nodeFrom).entries().next().value[0]);

  
  minT = new Date(minT*1000);
  maxT = new Date(maxT*1000);
  // console.log(`MIN : ${minT}  MAX: ${maxT}`);
  let minTforJobsChart = new Date(minT);
  minTforJobsChart.setMinutes(0,0,0);
  let maxTforJobsChart = new Date(maxT);
  maxTforJobsChart.setHours(maxTforJobsChart.getHours()+1);
  maxTforJobsChart.setMinutes(0,0,0);
  // console.log(`MINTHOUR : ${minTforJobsChart} MAXTHOUR : ${maxTforJobsChart} `);
  let totalJobsTimeSeries = [];
  let totalJobsSeries = [];
  let totalDistanceTimeSeries = [];
  let totalDistanceSeries = [];
  let columnChartIntervals = ['Hours','4 Hours','Days'];
  let columnCharIntervalsTime = {
    'Hours' : 60*60*1000,
    '4 Hours' : 60*60*1000*4,
    'Days' : 60*60*1000*24
  };

  function makeDateTimeString(granularity,minTime) {
    return (granularity === 'Days'?`${minTime.getDate()}/${minTime.getMonth()}/${minTime.getFullYear()}`
                          :`${minTime.getDate()}/${minTime.getMonth()} - ${minTime.getHours()}:00`);
  }
  function createGraphData(xAxisSeries,yAxisSeries,minTime,maxTime,granularity,chartType) {
    let i=0;
    while(minTime < maxTime) {
      xAxisSeries.push(makeDateTimeString(granularity,minTime));
      yAxisSeries[i] = 0;
      mainData.JobStats.forEach((job)=>{
        let tempTime = new Date(minTime).getTime();
        if(chartType === 'jobsTotal' && job.TimeStamp*1000>=tempTime && job.TimeStamp*1000<= tempTime+columnCharIntervalsTime[granularity]) {
          yAxisSeries[i]++;
        }
        if(chartType === 'distanceTotal' && job.TimeStamp*1000>=tempTime && job.TimeStamp*1000<= tempTime+columnCharIntervalsTime[granularity]) {
          yAxisSeries[i]+=job.Distance;
        }
      });
      i++;
      if(granularity === 'Hours') {
        minTime.setHours(minTime.getHours()+1);
      } else if (granularity === '4 Hours') {
        minTime.setHours(minTime.getHours()+4);
      } else {
        minTime.setDate(minTime.getDate()+1);
      }
    }
    // console.log(xAxisSeries);
    // console.log(yAxisSeries);
  };
  createGraphData(totalJobsTimeSeries,totalJobsSeries,minTforJobsChart,maxTforJobsChart,jobsChartGranularity,'jobsTotal');

  //FROM TIMEVAL GENERATOR
  let totalDistanceTimeSeriesFrom = [];
  let tempTimeStart1 = new Date(minT);
  tempTimeStart1.setMinutes(0,0,0);
  let tempTimeEnd1;
  if(distanceChartTo) {
    tempTimeEnd1 = new Date(parseInt(distanceChartTo));
  } else {
    tempTimeEnd1 = new Date(maxT);
    tempTimeEnd1.setHours(tempTimeEnd1.getHours()+1);
    tempTimeEnd1.setMinutes(0,0,0);
  }
  while(tempTimeStart1 < tempTimeEnd1) {
    totalDistanceTimeSeriesFrom.push({
      'timeObj':new Date(tempTimeStart1),
      'timeNotation':  makeDateTimeString(null,tempTimeStart1),
    });
    tempTimeStart1.setHours(tempTimeStart1.getHours()+1);
  }

  //TO TIMEVAL GENERATOR
  let totalDistanceTimeSeriesTo = [];
  let tempTimeStart2;
  if(distanceChartFrom) {
    tempTimeStart2 = new Date(parseInt(distanceChartFrom));
    tempTimeStart2.setMinutes(0,0,0);
  } else {
    tempTimeStart2 = new Date(minT);
    tempTimeStart2.setMinutes(0,0,0);
  }
  let tempTimeEnd2 = new Date(maxT);
  tempTimeEnd2.setHours(tempTimeEnd2.getHours()+1);
  tempTimeEnd2.setMinutes(0,0,0);
  while(tempTimeEnd2 > tempTimeStart2) {
    totalDistanceTimeSeriesTo.push({
      'timeObj':new Date(tempTimeEnd2),
      'timeNotation':  makeDateTimeString(null,tempTimeEnd2),
    });
    tempTimeEnd2.setHours(tempTimeEnd2.getHours()-1);
  }




  let minTforDistanceChart; 
  if(distanceChartFrom) {
    minTforDistanceChart = new Date(parseInt(distanceChartFrom));
  } else {
    minTforDistanceChart = new Date(minT);
    minTforDistanceChart.setMinutes(0,0,0);
  }
  let maxTforDistanceChart;
  if(distanceChartTo) {
    maxTforDistanceChart = new Date(parseInt(distanceChartTo));
  } else {
    maxTforDistanceChart = new Date(maxT);
    maxTforDistanceChart.setHours(maxTforDistanceChart.getHours()+1);
    maxTforDistanceChart.setMinutes(0,0,0);
  }
  createGraphData(totalDistanceTimeSeries,totalDistanceSeries,minTforDistanceChart,maxTforDistanceChart,distanceChartGranularity,'distanceTotal');


  let statusChartCountSeries = mainData.TotalStats[0].TotalStatusCount;
  let statusChartXSeries = () => {
    let tempArr = []
    for(let i = 0;i<statusChartCountSeries.length;i++) {
      tempArr.push(i);
    }
    return tempArr;
  };
  let gridConfig = {
    show: true,
    borderColor: '#90A4AE',
    strokeDashArray: 0,
    position: 'back',
    xaxis: {
        lines: {
            show: false
        }
    },   
    yaxis: {
        lines: {
            show: true
        }
    },  
    row: {
        colors: undefined,
        opacity: 0.5
    },  
    column: {
        colors: undefined,
        opacity: 0.5
    },  
    padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },  
  };
  const statusChartConfig = {
    series: [{
      name: 'Status Count',
      data: statusChartCountSeries
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        title: {
          text: 'Status Code',
          style: {
            fontSize:  '16px',
            fontWeight:  'bold',
            fontFamily:  'Arial, sans-serif',
            color:  'white'
          },
        },
        categories: statusChartXSeries(),
        labels: {
          style: {
              colors: 'white',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
          },
        }
      },
      yaxis: {
        title: {
          text: 'Status Count',
          style: {
            fontSize:  '16px',
            fontWeight:  'bold',
            fontFamily:  undefined,
            color:  'white'
          },
        },
        labels: {
          style: {
              colors: ['white'],
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
          },
        }
      },
      grid:gridConfig,
    },
  };
  const pieChartConfig = {
            series: [pieChartData.successCount, pieChartData.abortCount,pieChartData.emergencyCount],
            options: {
              labels: ['Success Count', 'Abort Count','Emergency Count'],
              colors:['#9CFF2E', '#F7A76C','#EC7272'],
              stroke: {
                show: false,
                curve: 'smooth',
                lineCap: 'butt',
                colors: 'black',
                width: 1,
                dashArray: 0,      
              },
              plotOptions: {
                pie: {
                  startAngle: 0,
                  endAngle: 360,
                  expandOnClick: false,
                  offsetX: 0,
                  offsetY: 0,
                  customScale: 1,
                  dataLabels: {
                      offset: 0,
                      minAngleToShowLabel: 10,
                  },
                  
                }
              },
              states: {
                normal: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.7,
                    }
                },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: {
                        type: 'darken',
                        value: 0.35,
                    }
                },
              },
              legend: {
                labels: {
                  colors: 'white',
                  useSeriesColors: false
                },
              }
            }
  };
  const totalJobsChartConfig = {
      series: [{
        name: 'Total Jobs Taken',
        data: totalJobsSeries
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: totalJobsTimeSeries,
          labels: {
            style: {
                colors: 'white',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
            },
          },
          title: {
            text: 'Status Code',
            style: {
              fontSize:  '16px',
              fontWeight:  'bold',
              fontFamily:  'Arial, sans-serif',
              color:  'white'
            },
          }
        },
        yaxis: {
          title: {
            text: 'Status Count',
            style: {
              fontSize:  '16px',
              fontWeight:  'bold',
              fontFamily:  undefined,
              color:  'white'
            },
          },
          labels: {
            style: {
                colors: ['white'],
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
            },
          }
        },
        grid:gridConfig,
      },
  };
  const totalDistanceChartConfig = {
      series: [{
        name: 'Total Distance Traveled',
        data: totalDistanceSeries
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: totalDistanceTimeSeries,
          labels: {
            style: {
                colors: 'white',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
            },
          },
          title: {
            text: 'Status Code',
            style: {
              fontSize:  '16px',
              fontWeight:  'bold',
              fontFamily:  'Arial, sans-serif',
              color:  'white'
            },
          }
        },
        yaxis: {
          title: {
            text: 'Status Count',
            style: {
              fontSize:  '16px',
              fontWeight:  'bold',
              fontFamily:  undefined,
              color:  'white'
            },
          },
          labels: {
            style: {
                colors: ['white'],
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
            },
          }
        },
        grid:gridConfig,
        tooltip: {
          style: {
            color: 'black',
          }
        }
      },
  };
  return (
    <>
      <div class="app-body">
        <div class="image-container">
          <img src="HBR_Logo.png" alt="Hachidori Robotics Logo"></img>
        </div>
        <hr ></hr>
        <h1 class="top-title">
          Robo Dashboard
        </h1>
        <div class="charts-container">
            <div class="chart">
              <h2>Status Chart</h2>
              <div>
                <ReactApexChart 
                  options={statusChartConfig.options} series={statusChartConfig.series} type="bar" width={700} >
                </ReactApexChart>
              </div>
            </div>
            <div class="chart">
              <h2>Job Success Chart</h2>
              <ReactApexChart 
                options={pieChartConfig.options} series={pieChartConfig.series} type="pie" width={600} >
              </ReactApexChart>
            </div>
            <div class="chart">
              <h2>Total jobs Chart</h2>
              <div>
                <label for="granularity">Granularity:</label>
                <select name="granularity" id="granularity" onChange={(e)=>{setColumnChartGranularity(e.target.value);}}>
                  {columnChartIntervals.map((e)=><option value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <ReactApexChart 
                  options={totalJobsChartConfig.options} series={totalJobsChartConfig.series} type="bar" width={700} >
                </ReactApexChart>
              </div>
            </div>
            <div class="chart">
              <h2>Total Distance Chart</h2>
              <div class = "chart-options">
                <div>
                  <label for="granularity">Granularity:</label>
                  <select name="granularity" id="granularity" onChange={(e)=>{setDistanceChartGranularity(e.target.value);}}>
                    {columnChartIntervals.map((e)=><option value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label for="from">From:</label>
                  <select name="from" id="from" onChange={(e)=>{setDistanceChartFrom(e.target.value);console.log((e.target.value))}}>
                    {totalDistanceTimeSeriesFrom.map((e)=><option value={e.timeObj.getTime()}>{e.timeNotation}</option>)}
                  </select>
                </div>
                <div>
                  <label for="to">To:</label>
                  <select name="to" id="to" onChange={(e)=>{setDistanceChartTo(e.target.value);}}>
                    {totalDistanceTimeSeriesTo.map((e)=><option value={e.timeObj.getTime()}>{e.timeNotation}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <ReactApexChart 
                  options={totalDistanceChartConfig.options} series={totalDistanceChartConfig.series} type="bar" width={700} >
                </ReactApexChart>
              </div>
            </div>
            <div class="chart special">
            <h2>Robo Trips Count</h2>
                <div class="trip-selectors">
                  <label for="fromNode">From Node:</label>
                  <select name="fromNode" id="fromNode" onChange={(e)=>{setNodeFrom(e.target.value);setNodeTo(tripMap.get(e.target.value).entries().next().value[0])}}>
                    {Array.from(tripMap.keys()).map((v)=><option value={v}>{v}</option>)}
                  </select>
                </div>
                <div class="trip-selectors">
                  <label for="toNode">To Node:</label>
                  <select name="toNode" id="toNode" onChange={(e)=>setNodeTo(e.target.value)} >
                    {Array.from(tripMap.get(nodeFrom).keys()).map((v)=><option value={v}>{v}</option>)}
                  </select>
                </div>
                <div class="trips">
                  Number of Trips : <span class="trips-big">{tripMap.get(nodeFrom).get(nodeTo)}</span>
                </div>
            </div>   
        </div>
      </div>
      
    </>
  );
}

export default App;
