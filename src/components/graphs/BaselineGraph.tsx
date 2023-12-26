import { VictoryScatter, VictoryChart, VictoryAxis, VictoryZoomContainer } from "victory";
import { BlockerRectangle, CustomLineSegment, ONE_DAY, GraphProps, GraphHeader, VictoryDateAxis, DefaultLine } from "./helpers";
import theme from "./graph-theme";
import { AnyMap, COLORS } from "../../helpers";
import useZoomRange from "./useZoomRange";

const BaselineGraph = ({ xZoomDomain, setXZoomDomain, data, now, pageWidth, tickCount, tickFormatter, zoomTo }: GraphProps) => {
    const [dataRange, minimumZoom] = useZoomRange(now, data, setXZoomDomain);
    const lines: AnyMap[] = [
        {
            y: "value",
            color: COLORS[0],
        }
    ];

    const keyMap: AnyMap = {
        value: "baseline score"
    };

    return (
        <div>
            <GraphHeader lines={lines} keyMap={keyMap} zoomTo={zoomTo} dataRange={dataRange} />
            <VictoryChart
                theme={theme}
                containerComponent={<VictoryZoomContainer
                    zoomDimension="x"
                    onZoomDomainChange={(domain) => setXZoomDomain(domain.x as [number, number])}
                    minimumZoom={{ x: minimumZoom }}
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
                        y={line.y}
                        style={{
                            data: { fill: line.color },
                        }}
                    />
                ))}

                <BlockerRectangle />
                <VictoryDateAxis data={data} tickFormatter={tickFormatter} tickCount={tickCount} />

                {/* Category axis (y) */}
                <VictoryAxis
                    crossAxis
                    dependentAxis
                    style={{
                        grid: { stroke: "grey" },
                        tickLabels: { padding: 4 },
                    }}
                    offsetX={80}
                    gridComponent={<CustomLineSegment dx1={30} />}
                />
            </VictoryChart>
        </div>
    );
};

export default BaselineGraph;
