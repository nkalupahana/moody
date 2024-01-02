import { GRAPH_BASE_OPTIONS, GRAPH_POINTS, GRAPH_SYNC_CHART, GraphProps, LineData, initialZoom } from "./helpers";
import { AnyMap } from "../../helpers";
import useGraphConfig from "./useGraphConfig";
import { useEffect, useMemo } from "react";
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { merge } from "lodash";
import InnerGraph from "./InnerGraph";

const LABEL_MAP: AnyMap = {
    0.5: "Normal",
    1.5: "Mild",
    2.5: "Moderate",
    3.5: "Severe",
    4.5: ["Extremely", "Severe"],
  };

const DASSGraph = ({ data, sync }: GraphProps) => {
    const { id, setId, dataRange, minimumZoom, startMinimum, minimumValue, canvas, now } = useGraphConfig(data);

    const lineData: LineData[] = useMemo(() => {
        return [{
            name: "Depression",
            color: "teal"
        }, {
            name: "Anxiety",
            color: "purple"
        }, {
            name: "Stress",
            color: "tomato"
        }];
    }, []);

    const options = useMemo(() => {
        return merge(GRAPH_BASE_OPTIONS(), sync ? GRAPH_SYNC_CHART : {}, GRAPH_POINTS, {
            plugins: {
                zoom: {
                    limits: {
                        x: {
                            min: data[0].timestamp,
                            max: now,
                            minRange: minimumZoom,
                        },
                    },
                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 5,
                    grid: {
                        color: function (context: any) {
                            if ([0, 1, 2, 3, 4, 5].includes(context.tick.value)) {
                                return "#bdbdbd"; // TODO: light/dark mode -- extract to helper
                            } else {
                                return "rgba(0, 0, 0, 0)";
                            }
                        },
                    },
                    ticks: {
                        callback: function (value: number) {
                            return LABEL_MAP[value] ?? "";
                        },
                        autoSkip: false
                    },
                }
            },
        }) as any;
    }, [data, minimumZoom, now, sync]);

    useEffect(() => {
        if (!canvas.current) return;
        Chart.register(zoomPlugin);
        const chart = new Chart(canvas.current, {
            type: "line",
            data: {
                labels: data.map((x) => x.timestamp),
                datasets: [
                    { data: data.map(x => x.d), borderColor: lineData[0].color },
                    { data: data.map(x => x.a), borderColor: lineData[1].color },
                    { data: data.map(x => x.s), borderColor: lineData[2].color }
                ],
            },
            options
        });
        
        initialZoom(chart, startMinimum, now);
        setId(Number(chart.id));

        return () => {
            chart.destroy();
        };
    }, [data, lineData, options, setId, startMinimum, now, canvas]);

    return <InnerGraph lineData={lineData} dataRange={dataRange} id={id} minimumValue={minimumValue} canvas={canvas} />
};

export default DASSGraph;
