import logo from './logo.svg';
import { useState , useEffect} from 'react';
import './App.css';
import ReactApexChart  from "react-apexcharts";
import myData from './data.json';


function App() {
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
  let [maxT,minT] = [0,Infinity]
  myData.JobStats.forEach((job,index)=>{
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
  });
  minT = new Date(minT*1000);
  maxT = new Date(maxT*1000);
  // console.log(`MIN : ${minT}  MAX: ${maxT}`);
  let minTforJobsChart = new Date(minT);
  minTforJobsChart.setMinutes(0,0,0);
  let maxTforJobsChart = new Date(maxT);
  maxTforJobsChart.setHours(maxTforJobsChart.getHours()+1);
  maxTforJobsChart.setMinutes(0,0,0);
  console.log(`MINTHOUR : ${minTforJobsChart} MAXTHOUR : ${maxTforJobsChart} `);
  let totalJobsTimeSeries = [];
  let totalJobsSeries = [];
  let totalDistanceTimeSeries = [];
  let totalDistanceSeries = [];
  let columnChartIntervals = ['Hours','4 Hours','Days'];
  let columnChartOf = ['jobsTotal','distanceTotal'];
  let columnCharIntervalsTime = {
    'Hours' : 60*60*1000,
    '4 Hours' : 60*60*1000*4,
    'Days' : 60*60*1000*24
  };


  function createGraphData(xAxisSeries,yAxisSeries,minTime,maxTime,granularity,chartType) {
    let i=0;
    while(minTime < maxTime) {
      xAxisSeries.push(granularity=='Days'?`${minTime.getDate()}/${minTime.getMonth()}/${minTime.getFullYear()}`
                          :`${minTime.getHours()}:${minTime.getMinutes()}:${minTime.getSeconds()} -   ${minTime.getDate()}/${minTime.getMonth()}/${minTime.getFullYear()}`);
      
      yAxisSeries[i] = 0;
      myData.JobStats.forEach((job)=>{
        let tempTime = new Date(minTime).getTime();
        if(chartType == 'jobsTotal' && job.TimeStamp*1000>=tempTime && job.TimeStamp*1000<= tempTime+columnCharIntervalsTime[granularity]) {
          yAxisSeries[i]++;
        }
        if(chartType == 'distanceTotal' && job.TimeStamp*1000>=tempTime && job.TimeStamp*1000<= tempTime+columnCharIntervalsTime[granularity]) {
          yAxisSeries[i]+=job.Distance;
        }
      });
      i++;
      if(granularity =='Hours') {
        minTime.setHours(minTime.getHours()+1);
      } else if (granularity =='4 Hours') {
        minTime.setHours(minTime.getHours()+4);
      } else {
        minTime.setDate(minTime.getDate()+1);
      }
    }
    console.log(xAxisSeries);
    console.log(yAxisSeries);
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
      'timeNotation':  `${tempTimeStart1.getHours()}:${tempTimeStart1.getMinutes()}:${tempTimeStart1.getSeconds()} -   ${tempTimeStart1.getDate()}/${tempTimeStart1.getMonth()}/${tempTimeStart1.getFullYear()}`
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
      'timeNotation':  `${tempTimeEnd2.getHours()}:${tempTimeEnd2.getMinutes()}:${tempTimeEnd2.getSeconds()} -   ${tempTimeEnd2.getDate()}/${tempTimeEnd2.getMonth()}/${tempTimeEnd2.getFullYear()}`
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
  

  const pieChartConfig = {
            series: [pieChartData.successCount, pieChartData.abortCount,pieChartData.emergencyCount],
            options: {
              title: {
                text: 'Job Success Chart',
                align: 'center',
                margin: 10,
                offsetX: 0,
                offsetY: 0,
                floating: false,
                style: {
                  fontSize:  '24px',
                  fontWeight:  'bold',
                  fontFamily:  undefined,
                  color:  '#263238'
                },
              },
              labels: ['Success Count', 'Abort Count','Emergency Count'],
              colors:['#C3FF99', '#F7A76C','#EC7272'],
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
                        value: 0.5,
                    }
                },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: {
                        type: 'darken',
                        value: 0.35,
                    }
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
        },
        yaxis: {
          title: {
            text: 'Total Jobs taken'
          }
        },
        fill: {
          opacity: 1
        },
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
        },
        yaxis: {
          title: {
            text: 'Total Distance Traveled'
          }
        },
        fill: {
          opacity: 1
        },
      },
    };
  return (
    <>
      <div>
        <ReactApexChart 
          options={pieChartConfig.options} series={pieChartConfig.series} type="pie" width={700} >
        </ReactApexChart>
      </div>
      <div>
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
      <div>
        <h2>Total Distance Chart</h2>
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
        
        <div>
          <ReactApexChart 
            options={totalDistanceChartConfig.options} series={totalDistanceChartConfig.series} type="bar" width={1000} >
          </ReactApexChart>
        </div>
      </div>
      
    </>
  );
}

export default App;
