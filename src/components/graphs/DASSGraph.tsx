import { VictoryScatter, VictoryChart, VictoryAxis, VictoryZoomContainer } from "victory";
import { BlockerRectangle, CustomLineSegment, CustomVictoryLabel, ONE_DAY, GraphProps, GraphHeader, VictoryDateAxis, DefaultLine } from "./graph-helpers";
import theme from "./graph-theme";
import { AnyMap } from "../../helpers";

const DASSGraph = ({ xZoomDomain, setXZoomDomain, data, now, pageWidth, tickCount, tickFormatter, zoomTo }: GraphProps) => {
    const labels = ["Normal", "Mild", "Moderate", "Severe", "Extremely\nSevere", ""];
    const lines: AnyMap[] = [
        {
            y: "d",
            color: "teal",
        },
        {
            y: "a",
            color: "purple",
        },
        {
            y: "s",
            color: "tomato",
        },
    ];

    const keyMap: AnyMap = {
        d: "Depression",
        a: "Anxiety",
        s: "Stress",
    };

    const jitterMap: AnyMap = {
        d: 0.03,
        a: 0,
        s: -0.03,
    };

    return (
        <div>
            <GraphHeader lines={lines} keyMap={keyMap} zoomTo={zoomTo} />
            
            <VictoryChart
                theme={theme}
                domainPadding={{ x: [25, 0], y: [0, 0] }}
                containerComponent={<VictoryZoomContainer
                    zoomDimension="x"
                    onZoomDomainChange={(domain) => setXZoomDomain(domain.x as [number, number])}
                    minimumZoom={{ x: ONE_DAY * 60 }}
                    zoomDomain={{ x: xZoomDomain }}
                />}
                maxDomain={{ x: now + ONE_DAY * 3 }}
                width={pageWidth}
            >
                {/* Lines */}
                {lines.map(line => <DefaultLine data={data} line={line} key={line.y} />)}

                {/* Points on line */}
                {lines.map((line) => (
                    <VictoryScatter
                        key={line.y}
                        data={data}
                        x="timestamp"
                        y={(d) => {
                            let jitter = 0;
                            for (let letter of ["d", "a", "s"]) {
                                if (letter === line.y) continue;
                                if (d[line.y] === d[letter]) {
                                    jitter = jitterMap[line.y];
                                    break;
                                }
                            }

                            return d[line.y] + jitter;
                        }}
                        style={{
                            data: { fill: line.color },
                        }}
                    />
                ))}

                <BlockerRectangle />
                <VictoryDateAxis tickFormatter={tickFormatter} tickCount={tickCount} />

                {/* Category axis (y) */}
                <VictoryAxis
                    crossAxis
                    dependentAxis
                    tickValues={[0, 1, 2, 3, 4, 5]}
                    tickFormat={(t) => labels[t]}
                    style={{
                        grid: { stroke: "grey" },
                        tickLabels: { padding: 4 },
                    }}
                    offsetX={80}
                    gridComponent={<CustomLineSegment dx1={30} />}
                    tickLabelComponent={<CustomVictoryLabel dy1={-28} />}
                />
            </VictoryChart>
        </div>
    );
};

export default DASSGraph;
