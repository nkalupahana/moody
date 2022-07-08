import "./JournalComponents.css";
import { useEffect, useRef } from "react";
import history from "../../history";
import { signOutAndCleanUp } from "../../firebase";
import { closeOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import KeyboardSpacer from "../KeyboardSpacer";
import { checkKeys, decrypt, encrypt, parseSettings } from "../../helpers";

const WriteJournal = ({ setMoodRead, moodWrite, ...props }) => {
    const keys = checkKeys();
    const textarea = useRef();
    const next = () => {
        history.push("/journal/finish");
    };

    useEffect(() => {
        setMoodRead(moodWrite);
    }, [setMoodRead, moodWrite]);

    useEffect(() => {
        if (localStorage.getItem("eautosave")) {
            if (typeof keys === "object") {
                const pwd = sessionStorage.getItem("pwd");
                if (pwd) props.setText(decrypt(localStorage.getItem("eautosave"), pwd));
            }
        } else {
            const autosave = localStorage.getItem("autosave");
            if (autosave) {
                props.setText(autosave);
            }
        }

        textarea.current?.focus();
    }, []);

    useEffect(() => {
        if (parseSettings()["pdp"]) {
            localStorage.setItem("eautosave", encrypt(props.text, sessionStorage.getItem("pwd")));
        } else {
            localStorage.setItem("autosave", props.text);
        }
    }, [props.text]);

    return (
        <div className="container">
            <IonIcon class="top-corner x" icon={closeOutline} onClick={() => history.push("/summary")}></IonIcon>
            <div className="center-journal">
                <div className="title" onClick={signOutAndCleanUp}>What's happening?</div>
                <p className="text-center bold" onClick={next}>If you don't want to write right now, tap here to jump to mood logging.</p>
                <label data-value={props.text} className="input-sizer stacked">
                    <textarea ref={textarea} className="tx" value={props.text} onInput={e => props.setText(e.target.value)} rows="1" placeholder="Start typing here!"></textarea>
                </label>
                { props.text.trim() && <div onClick={next} className="fake-button">Continue</div> }
                <KeyboardSpacer />
                <br />
            </div>
        </div>
    );
};

export default WriteJournal;
