import Chart from '@/components/echarts/chart';
import { grid, title as titleConfig } from '@/components/echarts/config';
import EmptyData from '@/components/empty-data';
import _ from 'lodash';
import { memo, useCallback, useMemo, useRef } from 'react';
import { ChartProps } from './types';

const options: any = {
  animation: false,
  grid: {
    ...grid,
    right: -1,
    top: -1,
    bottom: -1,
    left: -1,
    containLabel: true,
    borderRadius: 4
  },
  xAxis: {
    min: -1,
    max: 1,
    scale: false,
    slient: true,
    splitNumber: 15,
    splitLine: {
      lineStyle: {
        color: '#F2F2F2'
      }
    },
    axisLine: {
      show: false,
      lineStyle: {
        color: '#F2F2F2'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    },
    boundaryGap: [0.05, 0.05]
  },
  yAxis: {
    min: -1,
    max: 1,
    scale: false,
    slient: true,
    splitNumber: 10,
    boundaryGap: [0.05, 0.05],
    splitLine: {
      lineStyle: {
        color: '#F2F2F2'
      }
    },
    axisLine: {
      show: false,
      lineStyle: {
        color: '#F2F2F2'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    }
  },

  symbol: 'roundRect',
  label: {
    show: true,
    shadowColor: 'none',
    textBorderColor: 'none',
    formatter: (params: any) => {
      return params.name;
    }
  },
  series: []
};

const Scatter: React.FC<ChartProps> = (props) => {
  const { seriesData, xAxisData, height, width, showEmpty, title } = props;

  const chart = useRef<any>(null);

  const findOverlappingPoints = useCallback(
    (data: any[], currentPoint: any) => {
      const overlappingPoints = [];
      const symbolRadius = 16;

      const [x1, y1] = chart.current.chart?.convertToPixel(
        'grid',
        currentPoint.value
      );

      const pixelPoints = data.map((point) => {
        return {
          ...point,
          value: chart.current.chart?.convertToPixel('grid', point.value)
        };
      });

      for (let j = 0; j < pixelPoints.length; j++) {
        if (currentPoint.name === pixelPoints[j].name) {
          overlappingPoints.push({ ...pixelPoints[j] });
          continue;
        }
        const [x2, y2] = pixelPoints[j].value;

        const distance = Math.sqrt(
          Math.pow(_.round(x2 - x1, 2), 2) + Math.pow(_.round(y2 - y1, 2), 2)
        );

        if (distance <= symbolRadius) {
          overlappingPoints.push({ ...pixelPoints[j] });
        }
      }

      return overlappingPoints;
    },
    []
  );

  const renderNameInTooltip = useCallback((dataList: any[]) => {
    if (!dataList.length || dataList.length < 2) {
      return null;
    }
    const renderText = (item: any) => {
      return `<span class="tooltip-item-name">
               <span style="display:flex;justify-content:center;align-items: center;color:#fff;
               margin-right:0;border-radius:4px;width:14px;
               height:14px;background-color:${item?.itemStyle?.color};"
               >${item.name}</span>
             </span>`;
    };
    return renderText;
  }, []);
  const dataOptions = useMemo((): any => {
    const seriseDataList = seriesData.map((item: any, index: number) => {
      return {
        ...item,
        itemStyle: {
          color: '#5470c6'
        },
        symbolSize: 16
      };
    });
    return {
      ...options,
      tooltip: {
        trigger: 'item',
        borderWidth: 0,
        formatter(params: any, callback?: (val: any) => any) {
          const dataList = findOverlappingPoints(seriseDataList, params.data);
          let result = '';
          const renderText: any = renderNameInTooltip(dataList);
          dataList.forEach((item: any) => {
            result += `
            <span class="tooltip-item" style="justify-content: flex-start;">
             ${renderText ? renderText(item) : ''}
             <span class="tooltip-value">${item.text}</span>
            </span>`;
          });
          return `<div class="tooltip-wrapper">${result}</div>`;
        }
      },
      title: {
        ...titleConfig,
        text: title
      },
      series: {
        type: 'scatter',
        labelLayout: {
          hideOverlap: true
        },
        data: seriseDataList
      }
    };
  }, [seriesData, xAxisData, title, findOverlappingPoints]);

  return (
    <>
      {!seriesData.length && showEmpty ? (
        <EmptyData height={height} title={title}></EmptyData>
      ) : (
        <Chart
          ref={chart}
          height={height}
          options={dataOptions}
          width={width || '100%'}
        ></Chart>
      )}
    </>
  );
};

export default memo(Scatter);
