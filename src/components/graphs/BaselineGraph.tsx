import { GRAPH_BASE_OPTIONS, GRAPH_NO_POINTS, GRAPH_SYNC_CHART, GraphProps, LineData, initialZoom, chooseTicks } from "./helpers";
import { COLORS } from "../../helpers";
import useGraphConfig from "./useGraphConfig";
import { useEffect, useMemo } from "react";
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { merge } from "lodash";
import InnerGraph from "./InnerGraph";

const BaselineGraph = ({ data, sync }: GraphProps) => {
    const { id, setId, dataRange, minimumZoom, startMinimum, canvas, leftLimit, rightLimit } = useGraphConfig(data);

    const lineData: LineData[] = useMemo(() => {
        return [{
            name: "baseline score",
            color: COLORS[0],
        }];
    }, []);

    const yRange = useMemo(() => {
        const min = Math.min(...data.map(d => d.value));
        const max = Math.max(...data.map(d => d.value));
        return { min: min - 0.4, max: max + 0.4 };
    }, [data]);

    const options = useMemo(() => {
        return merge(GRAPH_BASE_OPTIONS(), sync ? GRAPH_SYNC_CHART : {}, GRAPH_NO_POINTS, {
            spanGaps: false,
            parsing: {
                xAxisKey: "timestamp",
                yAxisKey: "value",
            },
            plugins: {
                zoom: {
                    limits: {
                        x: {
                            min: leftLimit,
                            max: rightLimit,
                            minRange: minimumZoom,
                        },
                    },
                    zoom: {
                        onZoom: ({ chart }: { chart: Chart }) => {
                            chooseTicks(chart, data[0].timestamp, data[data.length - 1].timestamp, 15);
                          },
                    }
                },
            },
            scales: {
                y: {
                    ...yRange,
                    ticks: {
                        callback: function (value: number) {
                            return "  " + value.toFixed(1);
                        }
                    }
                },
            },
        }) as any;
    }, [sync, leftLimit, rightLimit, minimumZoom, yRange, data]);

    useEffect(() => {
        if (!canvas.current) return;
        Chart.register(zoomPlugin);
        const chart = new Chart(canvas.current, {
            type: "line",
            data: {
                datasets: [{ data, borderColor: lineData[0].color }],
            },
            options
        });
        
        initialZoom(chart, startMinimum, rightLimit, data[data.length - 1].timestamp, data[0].timestamp);
        setId(Number(chart.id));

        return () => {
            chart.destroy();
        };
    }, [lineData, options, setId, startMinimum, leftLimit, rightLimit, canvas, data]);

    return <InnerGraph lineData={lineData} dataRange={dataRange} id={id} leftLimit={leftLimit} rightLimit={rightLimit} canvas={canvas} sync={sync} />
};

export default BaselineGraph;
