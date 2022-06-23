import { Log } from "../../../db";
import WeekMoodLogList from "./WeekMoodLogList";
import WeekMoodGraph from "./WeekMoodGraph";
import { useState } from "react";
import { DateTime } from "luxon";

interface Props {
    setMenuDisabled: (disabled: boolean) => void;
    logs: Log[];
}

const WeekSummary = ({ setMenuDisabled, logs } : Props) => {
    const [requestedDate, setRequestedDate] = useState({
        el: undefined,
        timeout: undefined,
        list: {
            trustRegion: undefined,
            last: `i-locator-${DateTime.now().toISODate()}`
        },
        graph: {
            trustRegion: undefined,
            last: `g-locator-${DateTime.now().toISODate()}`
        }
    });

    /*
    SCROLL DEBUG LOGGER
    useEffect(() => {
        console.log(requestedDate);
    }, [requestedDate]);
    */

    return (
        <div className="week-summary-grid" style={(logs && logs.length > 0) ? {} : {"height": "100%"}}>
            <div style={{ gridArea: "heading" }} className="center-summary">
                <div className="title"><span>Here's how your week</span> <span>has been looking.</span></div>
            </div>
            { logs && logs.length > 0 && <>
                <WeekMoodGraph requestedDate={requestedDate} setRequestedDate={setRequestedDate} logs={logs}></WeekMoodGraph>
                <WeekMoodLogList setMenuDisabled={setMenuDisabled} logs={logs} requestedDate={requestedDate} setRequestedDate={setRequestedDate} />
            </> }
        </div>
    );
};

export default WeekSummary;
